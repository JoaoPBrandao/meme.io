const Route = require("./Route.js");

class MemesRoute extends Route {
    constructor(basePath) {
        super('/memes');

        this.router.get('/', (req, res) => {
            res.render('repositorio.ejs', {});
        });
    }
}

module.exports = MemesRoute;