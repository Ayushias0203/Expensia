const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({

    flow: {
        type: String
    },

    userid: {
        type: String
    },
    amount: {
        type: Number,
        required: [true, 'Please add a number']
    },
    category: {
        type: String,
        required: [true, 'Please select one of these category']
    },
    mode: {
        type: String,
        required: [true, 'Please select one of these category']
    },
    note: {
        type: String,
        trim: true,
        required: [true, 'Please add some text']
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    year: {
        type: String
    },
    month: {
        type: String
    },
});
module.exports =  mongoose.model('Transaction', TransactionSchema);
