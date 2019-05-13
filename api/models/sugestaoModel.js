const mongoose = require("mongoose");

const sugestaoSchema = new mongoose.Schema(
    {
        "idMeme": {
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

const Sugestao = mongoose.model('Sugestao', sugestaoSchema);

module.exports = Sugestao;