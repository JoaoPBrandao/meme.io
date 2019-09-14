//Este arquivo serve como controller para as sessões
class SessionController {
    static authenticationMiddleware() {
        return function (req, res, next) {
            if (req.isAuthenticated()) {
                return next()
            }
            res.redirect('/');
        }
    }
}

module.exports = SessionController;