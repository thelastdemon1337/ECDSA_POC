const mongoose = require("mongoose");

const keySchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    pvt: {
        type: String,
        required: true,
        unique: true,
    },
    signer: {
        type: String,
        required: true,
        unique: true,
    },
});

const Key = mongoose.model("Key", keySchema);

module.exports = Key;
