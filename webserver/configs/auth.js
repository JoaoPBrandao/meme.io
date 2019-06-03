// Esse arquivo serve apenas para configurar o sistema de autenticação do passport.

const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const UsuariosController = require("../controllers/UsuariosController.js");
const axios = require("axios");
const rota = require('./rota'); //Arquivo com as chaves das APIs utilizadas


module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null,user._id);
    });

    passport.deserializeUser((id, done) => {
        axios.get(rota + "/usuarios/id", {params: {_id: id}})
            .then(apiResponse => {
                usuario = apiResponse.data;
                done(null, usuario);
            });
    });

    passport.use(new LocalStrategy(
        (username, password, done) => {
            axios.get(rota + "/usuarios/email", {params: {email: username}})
                .then(apiResponse => {
                    if(apiResponse.status != 200){
                        return done(err);
                    }
                    if(!apiResponse.data){
                        return done(null, false);
                    }
                    if(apiResponse.data.status == 0){
                        return done(null, false);
                    }

                    bcrypt.compare(password, apiResponse.data.senha, (err, isValid) => {
                        if (err) {
                            return done(err)
                        }
                        if (!isValid) {
                            return done(null, false)
                        }
                        return done(null, apiResponse.data)
                    })
                });
        }
    ));
};

