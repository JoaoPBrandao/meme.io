// Esse arquivo serve apenas para configurar o sistema de autenticação do passport.
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const UsuariosController = require('../controllers/UsuariosController.js');
const axios = require('axios');
const rota = require('./rota'); //Arquivo com as chaves das APIs utilizadas
const stream = require('getstream');
const client = stream.connect(
  '55j5n3pfjx3u',
  '29kr9qdxat6gx4uw5d53sg3akbymwf7qcs85252bmhakxt426zjxctaaah3j9hdr',
  '54136'
);

module.exports = passport => {
  passport.serializeUser((user, done) => {
    const userToken = client.createUserToken(user._id);
    done(null, { _id: user._id, userToken: userToken });
  });

  passport.deserializeUser((id, done) => {
    axios.get(rota + '/usuarios?_id=' + id._id).then(apiResponse => {
      let usuario = apiResponse.data[0];
      usuario.userToken = id.userToken;
      done(null, usuario);
    });
  });

  passport.use(
    new LocalStrategy((username, password, done) => {
      axios.get(rota + '/usuarios?email=' + username).then(apiResponse => {
        if (apiResponse.status != 200) {
          return done(err);
        }
        if (!apiResponse.data) {
          return done(null, false);
        }
        if (apiResponse.data[0].status == 0) {
          return done(null, false);
        }

        bcrypt.compare(password, apiResponse.data[0].senha, (err, isValid) => {
          if (err) {
            return done(err);
          }
          if (!isValid) {
            return done(null, false);
          }
          return done(null, apiResponse.data[0]);
        });
      });
    })
  );
};
