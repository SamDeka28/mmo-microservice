let { Routify } = require("lane-js");
let { fetchRooms, onPlayerDisconnect, saveMatchState, getGameRoutes } = require("../controller/game.controller");

let routes = new Routify("game");

routes.get("/rooms", fetchRooms);
routes.put("/onDisconnect", onPlayerDisconnect);
routes.post("/saveMatchStat", saveMatchState);
routes.post("/routes", getGameRoutes)
module.exports = routes.expose();
