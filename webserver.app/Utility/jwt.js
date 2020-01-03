let expressJwt = require("express-jwt");
let { jwt: { secret } } = require("../config");

function jwt(req, res, next) {
    return expressJwt({ secret }).unless({
        path: [
            "/prometheus/metrics",
            "/users/one",
            "/users/two",
            "/docs"
            , "/users/login"
            , "/users/register"
            , "/game/rooms"
        ]
    });
}

module.exports = jwt;