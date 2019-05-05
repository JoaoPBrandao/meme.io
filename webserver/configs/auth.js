// Esse arquivo serve apenas para configurar o sistema de autenticação do passport.

const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const UsuariosController = require("../controllers/UsuariosController.js");
const axios = require("axios");

module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null,user._id);
    });

    passport.deserializeUser((id, done) => {
        axios.get("http://localhost" + ":" + "3000" + "/usuarios/id", {params: {_id: id}})
            .then(apiResponse => {
                usuario = apiResponse.data;
                done(null, usuario);
            });
    });

    passport.use(new LocalStrategy(
        (username, password, done) => {
            axios.get("http://localhost" + ":" + "3000" + "/usuarios/email", {params: {email: username}})
                .then(apiResponse => {
                    if(apiResponse.status != 200){
                        return done(err);
                    }
                    if(!apiResponse.data){
                        return done(null, false);
                    }
                    if(password == apiResponse.data.senha){
                        return done(null, apiResponse.data);
                    }else{
                        return done(null, false);
                    }
                    });
        }
    ));
};

