### Natours

Welcome to the official repository for the **Natours Project**, a comprehensive back-end application built with Node.js, Express, MongoDB, and Mongoose. This project provides a scalable, feature-rich RESTful API and a server-side rendered website, designed for managing a travel company’s tours and bookings.

🌟 [Live Demo](https://natours-85gu.onrender.com/)

## 📋 Features and Functionality

- **RESTful API**: Manage tours, reviews, users, and bookings.
- **Server-Side Rendering**: Dynamic pages using Pug templates.
- **CRUD Operations**: Perform CRUD operations on tours and bookings with MongoDB.
- **Geospatial Data**: Search tours based on location.
- **Pagination, Sorting, and Filtering**: Filter and sort tours.
- **Responsive Design**: Fully responsive for all devices.

### **Authentication & Authorization**:
- **JWT Authentication**: Secure login with JWTs via cookies.
- **Role-based Access Control**: 
  - **Admin**: Full access.
  - **User**: Access to personal routes (bookings, reviews).
  - **Lead-Guide**: Manages tours and guides.
  - **Guide**: Limited tour and booking access.

### **Error Handling**:
- **Global Error Handling**: Catch and manage errors, including unhandled routes and async errors.
- **Mongoose Error Handling**: Manage DB errors (invalid IDs, duplicate fields).

### **Security**:
- **Rate Limiting**: Prevent abuse by limiting requests.
- **Secure HTTP Headers**: Protect the application.
- **Data Sanitization**: Prevent malicious input.
- **CORS**: Control resource sharing between domains.

### **Payment & Email**:
- **Stripe Integration**: Handle payments for bookings.
- **Email Notifications**: Send booking confirmations and notifications.


## 🛠️ Tech Stack

- **Back-End**:
  - Node.js
  - Express.js
  - MongoDB
  - Mongoose
  - JWT (JSON Web Tokens)
  - Stripe (for payments)
  - Sendgrid (for email notifications)
  - Mailtrap, Mailsac (for testing email functionality)
  - Multer (for image uploads)
  - esbuild (for bundling)

- **Frontend**:
  - Pug (for server-side rendering)
  - HTML5, CSS3, JavaScript (ES6+)

- **Development Tools**:
  - Git & GitHub for version control
  - Visual Studio Code (VS Code) for coding
  - Postman for API testing

## 🚀 Deployment

- Hosted on **Render** for a fast, reliable, and scalable web experience.

## 📚 Postman Documentation

You can view the API documentation via Postman:  
[Postman Documentation](https://documenter.getpostman.com/view/23767871/2sAYJ4jgr4)

## 🔧 Setup and Installation

1. Clone the repository:  
   `git clone https://github.com/KishoreKarthi007/Natours.git`

2. Navigate to the project directory:  
   `cd natours`

3. Install dependencies:  
   `npm install`

4. Set up environment variables:  
   - Create a `.env` file in the root directory and add the required variables (like MongoDB URI, JWT secret, Stripe keys, etc.).

5. Start the application:  
   `npm run dev`

6. Open the browser and visit `http://localhost:3000` to view the website locally.

## 📌 Future Enhancements

- **User Review Restrictions**: Only users who have booked a tour can review it.
- **Nested Booking Routes**: Implement `/tours/:id/bookings` and `/users/:id/bookings` for managing bookings by tour and user.
- **Improved Tour Dates**: Add `participants` and `soldOut` fields to tour dates. Check availability before booking.
- **Advanced Authentication**: Implement email confirmation, refresh tokens, and two-factor authentication (2FA).
- **Search for Tours**: Add a search feature to filter tours by categories and keywords.
- **Admin Panel**: Create an admin panel for managing tours, users, reviews, and bookings.


## 🤝 Connect

For inquiries or collaboration, feel free to reach out:

- **Email**: [kishorekarthikeyan123@gmail.com](mailto:kishorekarthikeyan123@gmail.com)
- **GitHub**: [KishoreKarthi007](https://github.com/KishoreKarthi007)
