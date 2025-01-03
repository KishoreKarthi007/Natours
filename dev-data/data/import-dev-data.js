const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './../../config.env' });

const DB =
    'mongodb+srv://kishore:kishorekarthikeyan123@cluster0.astgz.mongodb.net/natours?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(DB).then(() => {
    console.log('DB is Connected successfully');
});

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
// const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
// const reviews = JSON.parse(
//     fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
// );

// IMPORT DATA INTO DB
const importData = async () => {
    try {
        await Tour.create(tours);
        // await User.create(users, { validateBeforeSave: false });
        // await Review.create(reviews);
        console.log('Data successfully loaded!');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        // await User.deleteMany();
        // await Review.deleteMany();
        console.log('Data successfully deleted!');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}
