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
                if (Object.getOwnPropertyNames(post.reaction_counts).length == 0){
                    post.reaction_counts = {like: 0};
                };
            });
            feed.results = bubbleSort(feed.results);
            feed.results = feed.results.reverse();
            res.render('trending.ejs', {feed: feed, usuario: req.user});
        });
    }
}

module.exports = IndexRoute;

function bubbleSort(arr){
    var len = arr.length;
    for (var i = len-1; i>=0; i--){
        for(var j = 1; j<=i; j++){
            if(arr[j-1].reaction_counts.like>arr[j].reaction_counts.like){
                var temp = arr[j-1];
                arr[j-1] = arr[j];
                arr[j] = temp;
            }
        }
    }
    return arr;
};

function isEmpty(objeto){
    for(const atributo in objeto){
        if (objeto.hasOwnProperty(atributo)){
            return false;
        }
        return true;
    }
};