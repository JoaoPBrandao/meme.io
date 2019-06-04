const mongoose = require("mongoose");

const denunciaSchema = new mongoose.Schema(
    {
        "postID": {
            "type": String,
            "required": true
        },
        "postUrlImgur": {
            "type": String,
            "required": true
        },
        "postConteudo": {
            "type": String,
            "required": true
        },
        "usuarioID": {
            "type": String,
            "required": true
        },
        "conteudo": {
            "type": String,
            "required": true,
        }
    }
);

const Denuncia = mongoose.model('Denuncia', denunciaSchema);

module.exports = Denuncia;