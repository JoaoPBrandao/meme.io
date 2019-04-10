// A arquitetura idealizada desse servidor é:
//      1) Um coordenador de atividades, a classe WebServer, responsável por receber as requisições HTTP e direcioná-las para
// os componentes (e.g.: middleware) corretos ou informar a inexistência de um componente referente à requisição recebida.
//      2) Componentes Router, responsáveis por gerir as respostas às requisições recebidas.
//      3) Componentes View, responsáveis por renderizar (via EJS) as respostas às requisições recebidas.
// Sob a abstração Node/Express, procuramos manter a arquitetura desse servidor similar à MVC. A camada de abstração de dados,
// (Models), porém, se encontra sob a integração do webserver com a API desenvolvida nesse mesmo projeto.
// Vale notar que, enquanto o Webserver é feito especificamente para ser integrado a uma API que serve como DAL, a API
// desenvolvida é um sistema completamente independente.
// O estilo de OOP baseado em singletons ao invés de classes estáticas (que são possíveis graças ao ES6) é um esforço para
// manter-se mais próximo do OOP tradicional num ambiente tradicionalmente dedicado à scriptagem.


// A declaração abaixo é análoga ao import do Java:
const express = require("express");

class WebServer {
    // Precisamos da porta e o IP nos quais vamos servir. Por default, 80 e 0.0.0.0, como declarado no início da classe
    // e no construtor default:
    constructor(serverPort, serverHost, apiPort, apiHost) {
        this.serverPort = serverPort;
        this.serverHost = serverHost;
        this.apiPort = apiPort;
        this.apiHost = apiHost;
        this.serverDependencies = {      // De um ponto de vista das linguagens full-OOP tradicionais, aqui temos mais
                                         // imports. A diferença visível é que acessamos os imports pela variável na qual
                                         // os armazenamos, e não pelo nome da package ou biblioteca. Por isso e pela
                                         // possibilidade de declararmos mais de uma classe em um documento .js, optamos
                                         // por atrelar esses imports à classe, inclusive com semântica.
            path: require("path"),
            bodyParser: require("body-parser")
        };
        this.serverInstance = express();
    }

        // Configura as dependências e o middleware do servidor:
        setupServer() {
            // Encurtando nossas chamadas e tornando o código mais legível para fluentes em Node/Express:
            const app = this.serverInstance;
            const path = this.serverDependencies.path;
            const bodyParser = this.serverDependencies.bodyParser;

            // Servir arquivos estáticos (stylesheets, scripts, mídia, etc):
            app.use(express.static(path.join(__dirname, '/static')));

            // Body parser para interpretar os Posts:
            app.use(bodyParser.urlencoded({
                extended: true
            }));
            app.use(bodyParser.json());

            // Rotas:
            app.use('/', require(process.cwd() + '/routes/index.js'));
        }

        static startServer() {
            const app = new WebServer(8080, "localhost", 3000, "localhost");
            app.setupServer();
            app.serverInstance.listen(app.serverPort, app.serverHost, () => {
                console.log("Server iniciado em " + app.serverHost + ":" + app.serverPort);
            });
            // Abaixo, dizemos ao ambiente Node/Express que ele pode usar a class WebServer (podemos fazer require("WebServer").
            // Isso é análogo à declaração "package ABCD" em Java-like:
            module.exports = app;
        }

}

// Abaixo, o análogo ao "main" Java-like, porém fora de uma estrutura como "func main()" devido à natureza scriptada
// do Node/Express:
WebServer.startServer();