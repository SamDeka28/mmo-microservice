let { Routify } = require("lane-js");
let { register, login, logout } = require("../controller/players.controller");
let routes = new Routify("users");

routes.post("/register", register);
routes.post("/login", login);
routes.post("/logout", logout);

module.exports = routes.expose();