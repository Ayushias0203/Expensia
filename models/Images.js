const mongoose = require("mongoose");

var imageSchema = new mongoose.Schema({
    userid: String,
    name: String,
    desc: String,
    img:
    {
        type: String
    }
});

module.exports = mongoose.model('Image', imageSchema);
