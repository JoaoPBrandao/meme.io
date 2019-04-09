// Setup das dependências:
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");

// Instanciando servidor:
const api = express();

// Conectando com o BD:
const mongoURI = "mongodb+srv://memeIO:memeiopassword@memeio-fs7qy.mongodb.net/test?retryWrites=true";
mongoose.connect(mongoURI, {useNewUrlParser: true})
    .then(() => {
        console.log("BD conectado");
    })
    .catch(err => console.log(err));


// Body parser para interpretar os Posts:
api.use(bodyParser.urlencoded({
    extended: true
}));
api.use(bodyParser.json());

// Rotas:
api.use('/usuarios', require(process.cwd() + '/routes/usuarios.js'));

api.listen(3000, () => {
    console.log("Server iniciado. Porta: " + 3000);
});