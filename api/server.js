// Mesmo dentro da intenção de aplicação independente, nossa API/DAL foi feita pra conectar-se a um BD Mongo. A refatoração
// para um BD diferente exigiria um nível variante de esforço, dependendo da disponibilidade de ferramentas node/express
// similares à mongoose.
// Usando as bibliotecas de conexão com postgreSQL ou mySQL, por exemplo, teríamos pouquíssimo esforço necessário na
// refatoração, pois elas seguem paradigmas e até sintaxes similares à mongoose. Na ausência de tal similaridade, porém,
// teríamos que substituir nossas chamadas ao BD via funções JS (e.g.: object.save()) por queries SQL, sendo assim um
// esforço de refatoração consideravelmente maior.
const express = require('express');

// A databaseURI é utilizada para conectar a API ao BD via biblioteca mongoose.
class API {
  constructor(serverPort, serverHost, databaseURI) {
    this.serverPort = serverPort;
    this.serverHost = serverHost;
    this.databaseURI = databaseURI;
    this.serverDependencies = {
      mongoose: require('mongoose'),
      bodyParser: require('body-parser')
    };
    this.serverInstance = express();
  }

  // A função abaixo conecta a API ao BD Mongo Atlas. A configuração "useNewUrlParser" server apenas para indicar
  // ao servidor que não desejamos utilizar o método legado de string parser (ferramenta do BD que interpreta as
  // queries enviadas).
  // IMPORTANTE: A conexão da UNIRIO não permite transações com o Mongo Atlas. Para conectar a API, use 4g ou
  // outra rede que não da UNIRIO.
  connectDB() {
    const mongoose = this.serverDependencies.mongoose;
    const mongoURI = this.databaseURI;
    mongoose
      .connect(mongoURI, { useNewUrlParser: true })
      .then(() => {
        console.log('BD conectado');
      })
      .catch(err => console.log(err));
  }

  setupServer() {
    const api = this.serverInstance;
    const bodyParser = this.serverDependencies.bodyParser;

    api.use(
      bodyParser.urlencoded({
        extended: true
      })
    );
    api.use(bodyParser.json());

    api.use('/usuarios', require(process.cwd() + '/routes/usuarios.js'));
    api.use('/memes', require(process.cwd() + '/routes/memes.js'));
    api.use('/posts', require(process.cwd() + '/routes/posts.js'));
  }

  static startServer() {
    const api = new API(
      3000,
      'localhost',
      'mongodb+srv://memeIO:memeiopassword@memeio-fs7qy.mongodb.net/test?retryWrites=true'
    );
    api.connectDB();
    api.setupServer();
    module.exports = api.serverInstance.listen(api.serverPort, () => {
      console.log('Server iniciado. Porta: ' + api.serverPort);
    });
  }
}

API.startServer();
