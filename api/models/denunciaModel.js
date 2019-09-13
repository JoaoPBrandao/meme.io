const mongoose = require("mongoose");

//Esquema para o documento de Denúncias no MondoDB
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
            "required": true
        },
        "idImgur": {
            "type": String,
            "required": true
        }
    }
);

const Denuncia = mongoose.model('Denuncia', denunciaSchema);

module.exports = Denuncia;