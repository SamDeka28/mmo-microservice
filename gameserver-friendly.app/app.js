let { Server, pathify } = require("lane-js");
let socket = require("socket.io");
let { server: { port }, db: { connection_string } } = require("./config");
const mongoose = require("mongoose");
let gameRoutes = require("./routes/game");
mongoose.connect(connection_string);
/**
 * Instantiating Server
 */
let app = Server({
    urls: pathify(gameRoutes)
});
/**
 * Initializing socket.io
 */
global.io = socket.listen(app, { path: "/gameserver-friendly" });
/**
 * Initialize socket controller
 */
require("./socket.controller")(io);

app.listen(port, _ => console.log(`Server is up and listening at PORT::${port}`));