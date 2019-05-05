const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema(
    {
        "nome": {
            "type": String,
            "required": true
        },
        "email": {
            "type": String,
            "required": true
        },
        "status": { // Usuário ativo ou inativo, feito com tipo = Number para ser escalável. 0 = inativo, 1 = ativo.
            "type": Number,
            "default": 1,
            "required": true
        },
        "foto": {
            "type": String,
            "required": false
        },
        "senha": {
            "type": String,
            "required": true
        },
        "adm": {
            "type": Number,
            "default": 0,
            "required": true
        }
    }
);

const Usuario = mongoose.model('usuario', usuarioSchema);

module.exports = Usuario;