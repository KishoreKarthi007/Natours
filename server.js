const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
    console.error(err);
    console.log('UNCAUGHT EXCEPTION is shutting down');
    process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
    console.log('DB is Connected successfully');
});

// Start the server
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
    console.log(`Listening to the port ${PORT} ......`);
});

process.on('unhandledRejection', (err) => {
    console.error(err.name, err.message);
    console.log('UNHANDLED REJECTION is shutting down');

    server.close(() => {
        process.exit(1);
    });
});
