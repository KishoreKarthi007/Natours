const AppError = require('../utils/appError');

const handleCastError = (err) => {
    const message = `Invalid Id ${err.path} : ${err.value}`;
    return new AppError(message, 400);
};
const handleDuplicateFieldDB = (err) => {
    const regex = /dup key: { name: "(.*)" }/;
    const value = err.errmsg.match(regex)[1];
    const message = `Duplicate field value: "${value}" Please use another value!`;

    return new AppError(message, 400);
};
const handleValidationError = (err) => {
    const errorMsg = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid Input data: ${errorMsg.join('. ')}`;
    return new AppError(message, 400);
};

const handleJWTError = () =>
    new AppError('You are not logged in! Please login to get access', 401);

const handleJWTExpiredError = () =>
    new AppError('Your Token has Expired ! Please login again', 401);

const sendErrorDev = (err, req, res) => {
    // 1) API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            error: err,
            stack: err.stack,
        });
    }
    // 2) Rendered Website
    console.error('ERROR', err);
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message,
    });
};
const sendErrorProd = (err, req, res) => {
    // 1) API
    if (req.originalUrl.startsWith('/api')) {
        // Operational Errors
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }
        // Programming or Unknown Errors
        console.error('ERROR', err);
        return res.status(500).json({
            status: 'fail',
            message: 'Something went wrong...',
        });
    }
    // 2) Rendered Website
    // Operational Errors
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: err.message,
        });
    }
    // Programming or Unknown Errors
    console.error('ERROR', err);
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: 'Please try again later',
    });
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        if (err.name === 'CastError') err = handleCastError(err);
        if (err.code === 11000) err = handleDuplicateFieldDB(err);
        if (err.name === 'ValidationError') err = handleValidationError(err);
        if (err.name === 'JsonWebTokenError') err = handleJWTError();
        if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();

        sendErrorProd(err, req, res);
    }
};
