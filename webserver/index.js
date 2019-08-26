const WebServer = require("./WebServer.js");
const fs = require("fs");

const server = new WebServer(8080, "localhost", 3000, "localhost");
const app = server.serverInstance;

let routes = fs.readdirSync('./routes/');
//aaaaaaaaaaaaaaa fudi seu codigo
for (let routeFile of routes) {
    const Route = require('./routes/' + routeFile); // O require vai receber a classe "Route", então essa linha a instancia.
    let route = new Route('/');
    route.registerRoute(app);
}

server.startServer();