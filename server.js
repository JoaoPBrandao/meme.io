// Setup das dependências:
const express = require('express');
const bodyParser = require('body-parser');

// Instanciando servidor:
const api = express();

// Body parser para interpretar os Posts:
api.use(bodyParser.urlencoded({
    extended: true
}));
api.use(bodyParser.json());

// Rotas:
api.use('/', require(process.cwd() + '/routes/api.js'));

api.listen(3000, () => {
    console.log("Server iniciado. Porta: " + 3000);
});