// Esse arquivo serve apenas para configurar o sistema de autenticação do passport.

const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const UsuariosController = require("../controllers/UsuariosController.js");

module.exports = (passport) => {
    passport.use(
        new LocalStrategy({
            usernameField: 'emailUsuario'
        }, (email, password, done) => {
            let usuario = UsuariosController.buscarUsuarioAtivo(email);
            if(!usuario) {
                return done(null, false, {message: 'Usuário não encontrado'});
            }

            bcrypt.compare(password, usuario.senhaUsuario, (err, isMatch) => {
                if(err) throw err;

                if(isMatch) {
                    return done(null, usuario);
                } else {
                    return done(null, false, {message: "Combinação de usuário e senha inválida."})
                }
            });
        })
    );

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {

    });
};

