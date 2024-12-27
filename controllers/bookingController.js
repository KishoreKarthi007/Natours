const stripe = require('stripe')(`${process.env.STRIPE_SECRET_KEY}`);
const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handleFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1) Get the tour based on tourId
    const tour = await Tour.findById(req.params.tourId);

    // 2) Create a checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        // success_url: `${req.protocol}://${req.get('host')}/my-tours?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        success_url: `${req.protocol}://${req.get('host')}/my-tours`,
        cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        mode: 'payment',
        line_items: [
            {
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [
                            `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
                        ],
                    },
                    unit_amount: tour.price * 1000, // Amount in the smallest currency unit
                },
                quantity: 1,
            },
        ],
        shipping_address_collection: {
            allowed_countries: ['IN'], // Only allow India as the shipping country
        },
    });

    // 3) Create a response with the session
    res.status(200).json({
        status: 'success',
        session,
    });
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//     const { tour, user, price } = req.query;
//     if (!tour && !user && !price) return next();

//     await Booking.create({ tour, user, price });
//     res.redirect(req.originalUrl.split('?')[0]);
// });
const createBookingCheckout = async (session) => {
    const tour = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email })).id;
    const price = session.line_items[0].price_data.unit_amount / 1000;
    const book = await Booking.create({ tour, user, price });
    res.status(200).json({ book, received: true });
};

exports.webhookCheckout = async (req, res, next) => {
    const signature = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed') {
        const tour = event.data.object.client_reference_id;
        const user = (
            await User.findOne({ email: event.data.object.customer_email })
        ).id;
        const price =
            event.data.object.line_items[0].price_data.unit_amount / 1000;
        const book = await Booking.create({ tour, user, price });
        res.status(200).json({ book, received: true });
    }
    // res.status(200).json({ received: true });
};

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
