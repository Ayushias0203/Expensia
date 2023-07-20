const mongoose = require("mongoose");

const itemSchema = {
    name: String,
    userid: String
};

module.exports =  mongoose.model("Item", itemSchema);
