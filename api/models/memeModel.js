const mongoose = require("mongoose");

const memeSchema = new mongoose.Schema(
    {
        "foto": {
            "type": String,
            "required": true
        },
        "categorias": {
            "type": Array,
            "default": [],
            "required": true
        }
    }
);

const Meme = mongoose.model('meme', memeSchema);

module.exports = Meme;