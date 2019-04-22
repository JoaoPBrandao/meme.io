const mongoose = require("mongoose");

const memeSchema = new mongoose.Schema(
    {
        "urlImgur": {
            "type": String,
            "required": true
        },
        "categorias": {
            "type": Array,
            "default": [],
            "required": true
        },
        "data": {
            "type": String
        },
        "idImgur": {
            "type": String,
            "required": true
        }
    }
);

const Meme = mongoose.model('meme', memeSchema);

module.exports = Meme;