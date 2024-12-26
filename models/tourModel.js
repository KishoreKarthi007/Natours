const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Tour must contain a unique name'],
            unique: true,
            minLength: [10, 'Tour name must contain minimum 10 character'],
            maxLength: [40, 'Tour name must contain maximum 40 character'],
            // validate: [
            //     validator.isAlpha,
            //     'Tour name must contain only alphabets',
            // ],
        },
        slug: String,
        price: {
            type: Number,
            required: [true, 'Tour must contain a price'],
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) {
                    return val < this.price;
                },
                message: `Price Discount ({VALUE}) is greater than price`,
            },
        },
        duration: {
            type: Number,
            required: [true, 'Tour must contain a duration'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'Tour must contain maximum group size'],
        },
        difficulty: {
            type: String,
            required: [true, 'Tour must contain difficulty'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty can either be easy, medium or hard',
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Minimum rating is 1.0'],
            max: [5, 'Maximum rating is 5.0'],
            set: (val) => Math.round(val * 10) / 10,
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        summary: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [true, 'Tour must contain Image cover'],
        },
        images: {
            type: [String],
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false,
        },
        startDates: {
            type: [Date],
        },
        secretTour: {
            type: Boolean,
            default: false,
        },
        startLocation: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
            },
            description: String,
            address: String,
        },

        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point'],
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number,
            },
        ],
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
        ],
    },
    { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Index
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id',
});

// DOCUMENT MIDDLEWARE
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
    console.log('QUERY MIDDLEWARE Pre: Will be executed on query');
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});
tourSchema.post(/^find/, function (doc, next) {
    console.log('QUERY MIDDLEWARE Post: Will be executed on query');
    console.log(`Query took ${Date.now() - this.start} milliseconds`);
    next();
});
tourSchema.pre(/^find/, function (next) {
    console.log(
        'QUERY MIDDLEWARE Pre: Will be executed on query for populating guide'
    );
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt',
    });
    next();
});

// AGGREGATE MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//     console.log(
//         'AGGREGATE MIDDLEWARE Pre: Will be executed on aggregate pipline object'
//     );
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//     next();
// });
tourSchema.post('aggregate', function (doc, next) {
    console.log(
        'AGGREGATE MIDDLEWARE Post: Will be executed on aggregate pipline object'
    );
    console.log(this.pipeline());
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
