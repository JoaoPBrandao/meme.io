// A arquitetura desse servidor é baseada na nossa interpretação da arquitetura MVC aplicada no ambiente Node.js Express.
// Temos:
//      1) Um coordenador de atividades, a classe WebServer, responsável por receber as requisições HTTP e direcioná-las para
// os componentes (e.g.: middleware) corretos ou informar a inexistência de um componente referente à requisição recebida.
//      2) Componentes Route, responsáveis por gerir as respostas às requisições recebidas, representando a camada de
// front-controller na arquitetura MVC.
//      3) Componentes View, responsáveis por renderizar (via EJS, em HTML) as respostas às requisições recebidas.
//      4) Componentes Controller, responsáveis por executar a lógica de sistema para qualquer requisição, incluindo
// fazer a conexão entre os Models (5) e as Views;
//      5) Integração com a API que, aqui, serve como DAL. Não usamos models explicitamente no servidor pois o Controller
// envia e recebe os dados da API que faz ponte com o banco de dados.
// Vale notar que, enquanto o Webserver é feito especificamente para ser integrado a uma API que serve como DAL, a API
// desenvolvida é um sistema completamente independente e pode ser acoplada a diferentes BDs com esforço mínimo.


// As declarações abaixo são análogas ao import do Java:
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require('passport');
const flash = require("connect-flash");

class WebServer {
    // Precisamos da porta e o IP nos quais vamos servir. Por default, 80 e 0.0.0.0, como declarado no início da classe
    // e no construtor default:
    constructor(serverPort, serverHost, apiPort, apiHost) {
        this.serverPort = serverPort;
        this.serverHost = serverHost;
        this.apiPort = apiPort;
        this.apiHost = apiHost;
        this.serverDependencies = {
            path: path,
            bodyParser: bodyParser
        };
        this.serverInstance = express();
        this.setupServer();
    }

        // Configura as dependências e o middleware do servidor:
        setupServer() {
            // Encurtando nossas chamadas e tornando o código mais legível para fluentes em Node/Express:
            const app = this.serverInstance;
            const {path, bodyParser} = this.serverDependencies;

            // Servir arquivos estáticos (stylesheets, scripts, mídia, etc):
            app.use(express.static(path.join(__dirname, '/static')));

            // Body parser para interpretar os Posts:
            app.use(bodyParser.urlencoded({
                extended: true
            }));
            app.use(bodyParser.json());

            // Gestor de sessões do express:
            require(path.join(__dirname,'/configs/auth.js'))(passport);
            app.use(session({
                secret: 'alpha',
                resave: true,
                saveUninitialized: true,
            }));
            app.use(passport.initialize());
            app.use(passport.session());

            // Mensagens flash:
            app.use(flash());
        }

        startServer() {
            this.serverInstance.listen(this.serverPort, this.serverHost, () => {
                console.log("Server iniciado em " + this.serverHost + ":" + this.serverPort);
            });
        }

}

module.exports = WebServer;