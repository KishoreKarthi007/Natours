import axios from 'axios';
import { showAlert } from './alert';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your public key
const stripePromise = loadStripe('pk_test_51QZbmHSDw5o3u1vwoBInfoVJUt4wxQYsEbP2zPzGUnun74NiVwuCZbbF0Rq3g63wQQCAc8EfOoXqxyroFlAIJdJH00xAJjNcmO');

export const bookTour = async (tourId) => {
    try {
        // // 1) Get checkout session from API
        const session = await axios(
            `/api/v1/bookings/checkout-session/${tourId}`
        );

        // // 2) Wait for Stripe to load and redirect to checkout
        const stripe = await stripePromise; // Ensure Stripe is ready
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id,
        });
        

    } catch (err) {
        console.log(err);
        showAlert('error', err);
    }
};
