const mongoose = require('mongoose');
const Tour = require('../models/tourModel');

exports.convertIds = async () => {
    try {
        // Find all documents where _id is a string
        const docs = await Tour.find({ _id: { $type: 'string' } });

        if (docs.length === 0) {
            console.log('No documents found with string _id');
            return;
        }
        console.log(docs.length);

        // Iterate through documents and update the _id field
        const bulkOps = docs.map((doc) => {
            // Convert the string _id to ObjectId and return an update operation
            const objectId = new mongoose.Types.ObjectId(doc._id); // Use this to convert string to ObjectId
            console.log(doc._id, objectId);

            // return {
            //     updateOne: {
            //         filter: { _id: doc._id },
            //         update: { $set: { _id: objectId } },
            //     },
            // };
        });

        // // Perform the bulk write operation
        // if (bulkOps.length > 0) {
        //     const result = await Tour.bulkWrite(bulkOps);
        //     console.log(
        //         `Successfully updated ${result.modifiedCount} documents.`
        //     );
        // }
    } catch (error) {
        console.error('Error:', error);
    }
};
