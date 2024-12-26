const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOption = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === 'production') cookieOption.secure = true;

    res.cookie('jwt', token, cookieOption);

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user: user,
        },
    });
};

exports.signUp = catchAsync(async (req, res, next) => {
    // const newUser = await User.create(req.body);
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordResetToken: req.body.passwordResetToken,
        passwordResetExpires: req.body.passwordResetExpires,
    });
    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser, url).sendWelcome();
    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    if (!req.body.email || !req.body.password) {
        return next(
            new AppError('Please provide the email id and password', 400)
        );
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.checkPassword(password, user.password))) {
        return next(new AppError('Incorrect Email id and Password', 401));
    }

    createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    // Get token
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) token = req.cookies.jwt;
    // Check if token exist or not
    if (!token)
        return next(
            new AppError('You are not logged in! Please login to access', 401)
        );

    // Verify the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Check if the user exist or not
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError('The user belonging to this user no login exist.', 401)
        );
    }

    // Check if the password has been changed
    if (currentUser.changedPasswordAfter(decoded.iat))
        return next(
            new AppError(
                'The password has been changed ! Please login to again',
                401
            )
        );

    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'logged out', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: 'success' });
};

exports.isLoggedIn = async (req, res, next) => {
    try {
        // Get token
        if (req.cookies.jwt) {
            // Verify the token
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            // Check if the user exist or not
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            // Check if the password has been changed
            if (currentUser.changedPasswordAfter(decoded.iat)) return next();

            res.locals.user = currentUser;
            return next();
        }
    } catch (err) {
        return next();
    }

    next();
};

exports.restrictTo =
    (...roles) =>
    (req, res, next) => {
        if (!roles.includes(req.user.role))
            return next(
                new AppError(
                    'You dont have permission to perform the action',
                    403
                )
            );
        next();
    };

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get the user belonging to the email and user exist or not
    const user = await User.findOne({ email: req.body.email });
    if (!user)
        return next(
            new AppError(
                'There is no user with the email address provided! Please check your email address.',
                404
            )
        );

    // 2) Generate a reset token
    const resetToken = await user.changePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send the reset token to user's email
    const resetURL = `${req.protocol}://${req.get('host')}api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
        status: 'success',
        message: 'Token is sent to email!',
    });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get the user based on token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    // 2) Check if the user exist and the token has not expired. Set the new password
    if (!user) return next(new AppError('Token is invalid or expired', 400));

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    // 3) Update the changedPasswordAt property for the user
    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');
    // 2) Check if POSTed current password is correct
    if (!(await user.checkPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is wrong.', 401));
    }
    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
});
