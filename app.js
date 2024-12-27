const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const viewRoutes = require('./routes/viewRoutes');
const toursRouter = require('./routes/tourRoutes');
const usersRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const errorController = require('./controllers/errorController');
const bookingController = require('./controllers/bookingController');
const AppError = require('./utils/appError');

// Start the express app
const app = express();

app.enable('trust proxy');

// TEMPLATE ENGINE
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// GLOBAL MIDDLEWARE
// Serving Static File
app.use(express.static(path.join(__dirname, 'public')));

// Set Secured HTTP header
app.use(
    helmet({
        contentSecurityPolicy: false, // Disable Helmet's automatic CSP header
    })
);

// Implement Rate Limiting to the API
const limiter = rateLimit({
    limit: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests, please try again 1 hour later.',
});
app.use('/api', limiter);

// Development Logging
// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.post(
    '/webhook-checkout',
    express.raw({ type: 'application/json' }),
    bookingController.webhookCheckout
);

// Body Parser -> Reading the data from body to req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data Sanitization
// 1) Against NoSQL injection
app.use(mongoSanitize());
// 2) Against XSS
app.use(xss());

// Prevent Parameter Pollution
app.use(
    hpp({
        whitelist: [
            'duration',
            'maxGroupSize',
            'ratingsAverage',
            'ratingsQuantity',
            'difficulty',
            'price',
        ],
    })
);

// Compression Middleware
app.use(compression());

// Testing Middleware
app.use((req, res, next) => {
    // console.log('CSP Header Set:', res.getHeaders()); // Log the headers
    // console.log(req.cookies);
    next();
});

// ROUTES
app.use('/', viewRoutes);
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find the URL ${req.originalUrl}`, 404));
});

// GLOBAL ERROR HANDLING MIDDLEWARE
app.use(errorController);

module.exports = app;
