let { Server } = require("lane-js");
let { server: { port }, db: { connection_string } } = require("./config");
let mongoose = require("mongoose");
let middlewares = require("./Utility/appMiddlewares");
let appRoutes = require("./Utility/appRoutes");
/**
 * Connect to mongodb
 */
mongoose.connect(connection_string);
/**
 * Instantiating Server
 */
let app = Server({
    urls: appRoutes
    , middlewares: middlewares
    , template_static: "public"
    , template_engine: "ejs"
    , template_directory: "public"
});

app.listen(port, _ => console.log(`Server is up and listening at PORT::${port}`));