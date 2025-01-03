const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Booking = require('../models/bookingModel');

exports.alerts = (req, res, next) => {
    const { alert } = req.query;
    if (alert === 'booking') res.locals.alert = 'Your booking was successful!';
    next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();

    res.status(200).render('overview', {
        title: 'All Tours',
        tours,
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user',
    });

    if (!tour) next(new AppError('There is no tour with that name', 404));

    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour,
    });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
    // 1) Find all bookings
    const booking = await Booking.find({ user: req.user.id });

    // 2)Find tours with returned id
    const tourId = booking.map((el) => el.tour);
    const tours = await Tour.find({ _id: { $in: tourId } });

    // 3) Send the response
    res.status(200).render('overview', {
        title: 'My Tours',
        tours,
    });
});

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: `Login`,
    });
};

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'My Account',
    });
};
