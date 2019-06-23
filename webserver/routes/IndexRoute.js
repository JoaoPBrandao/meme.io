const Route = require("./Route.js");
const SessionController = require("../controllers/SessionController.js");
const axios = require("axios"); // Usamos Axios para fazer as requests à API
const rota = require('../configs/rota');
const stream = require('getstream');
const client = stream.connect('55j5n3pfjx3u', '29kr9qdxat6gx4uw5d53sg3akbymwf7qcs85252bmhakxt426zjxctaaah3j9hdr', '54136');

class IndexRoute extends Route {
    constructor(basePath) {
        super('/');

        this.router.get('/', async (req, res) => {
            if (req.user){
                let memes;
                let feed;
                //TODO: BUSCAR APENAS POR MEMES APROVADOS
                await axios.get(rota + "/memes")
                    .then(apiResponse => {
                        memes = apiResponse.data;
                    })
                    .catch(err => console.log("Erro ao buscar memes na API."));
                await client.feed('timeline', req.user._id).get({ limit:20, offset:0, reactions: {own: true, counts: true} })
                    .then(apiResponse =>{
                        feed = apiResponse;
                    })
                    .catch(err => {
                        console.log("Erro ao buscar feed.");
                    });
                res.render('feed.ejs', {user: req.user, memes: memes, feed: feed});
            }else {
                res.render('landingpage.ejs', {});
            }
        });

        this.router.get('/login', (req, res) => {
            if (req.user){
                res.redirect('/');
            }else{
                res.render('login.ejs', {});
            }
        });


        this.router.get('/recuperarsenha', (req, res) => {
            if (req.user){
                res.redirect('/');
            }else {
                res.render('recuperarSenha.ejs', {});
            }
        });

        this.router.get('/trending', SessionController.authenticationMiddleware(), async (req, res) => {
            let feed;
            await client.feed('trending', 'trending').get({ limit:20, offset:0, reactions: {own: true, counts: true} })
                .then(apiResponse =>{
                    feed = apiResponse;
                })
                .catch(err => {
                    console.log("Erro ao buscar feed.");
                });
            feed.results.forEach(post => {
                if (isEmpty(post.reaction_count)){
                    post.reaction_count = {like: 0};
                };
            });
            feed.results = feed.results.sort(compare);
            res.render('trending.ejs', {feed: feed, usuario: req.user});
        });
    }
}

module.exports = IndexRoute;

function compare(a, b){
    let compareValue = 0;
    if (a.reaction_counts.like > b.reaction_counts.like){
        compareValue = -1;
    }else if(a.reaction_counts.like < b.reaction_counts.like){
        compareValue = 1;
    }
    return compareValue;
};

function isEmpty(objeto){
    for(const atributo in objeto){
        if (objeto.hasOwnProperty(atributo)){
            return false;
        }
        return true;
    }
};