const mongoose = require("mongoose");
const findOrCreate = require('mongoose-findorcreate');
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    balance: Number,
    totalCredit: Number,
    totalDebit: Number,
    xsavings: {
        type: Number,
        default: 0
    },
    xincome: {
        type: Number,
        default: 0
    },
    xgrocery: {
        type: Number,
        default: 0
    },
    xtranspartation: {
        type: Number,
        default: 0
    },
    xeducation: {
        type: Number,
        default: 0
    },
    xother: {
        type: Number,
        default: 0
    },
    xexpense: {
        type: Number,
        default: 0
    }
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

module.exports = mongoose.model("User", userSchema);
