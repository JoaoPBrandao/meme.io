//      Cada rota responde a requisições recebidas pelo WebServer e chama um Controller para agir sobre elas.
// Para fins de organização de código, nossa camada "front-controller" (rotas que chamam controllers) é dividida
// semanticamente entre finalidades da aplicação. Por isso temos, por exemplo, uma extensão de Route responsável por
// requisições para a raiz da aplicação, outra para '/usuários' e outra para '/memes'.
//      É importante notar que, enquanto a camada front-controller pode parecer redundante nessa aplicação específica,
// ela não o seria se aproveitássemos o potencial da arquitetura MVC por completo. O front-controller poderia, por exemplo,
// chamar diferentes controllers dependendo de estados do cliente (similar a como fazemos com a autenticação do usuário)
// e chamar loggers independentes do resto do sistema.

const Router = require('express').Router;

class Route {
  // Classe abstrata.
  // Assim que criada, a rota deve ser registrada no servidor Express. Fazemos isso pois não há motivo para instanciarmos uma
  // rota sem que o servidor registrá-la logo em seguida.
  // Importante: espera-se que, para cada classe de rota extendida, sejam implementadas as funções de seu router (e.g.:
  // this.router.get('/', (req, res) => { res.send("Olá, mundo") }. A nossa "main" (index.js) está preparada para
  // percorrer cada rota em "routes" e registrá-la, eliminando a necessidade de voltarmos ao index a cada nova rota que
  // fizermos.
  constructor(basePath) {
    this.router = Router();
    this.basePath = basePath;
  }

  registerRoute(app) {
    app.use(this.basePath, this.router);
  }
}

module.exports = Route;
