const mongoose = require("mongoose");

//Esquema para o documento de Usuários no MondoDB.
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
        //STATUS DO USUÁRIO, 0 = BANIDO, 1 = INATIVO, 2 = ATIVO
        "status": {
            "type": Number,
            "default": 2,
            "required": true
        },
        "foto": {
            "type": String,
            "required": true,
            "default": 'https://imgur.com/xqCh1RC.jpg'
        },
        "senha": {
            "type": String,
            "required": true
        },
        "adm": {
            "type": Number,
            "default": 0,
            "required": true
        },
        "recuperacao": {
            "type": Array,
            "default": [],
            "required": true
        },
        "denunciasAprovadas": {
            "type": Number,
            "default": 0,
            "required": true
        }
    }
);

const Usuario = mongoose.model('usuario', usuarioSchema);

module.exports = Usuario;