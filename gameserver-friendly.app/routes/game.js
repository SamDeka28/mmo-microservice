let { Routify } = require("lane-js");
let routes = new Routify("gameserver-online-api");

routes.get("/game/rooms", (req, res) => res.json(Object.keys(io.sockets.adapter.rooms)));

module.exports = routes.expose();