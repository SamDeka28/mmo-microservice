let morgan = require("morgan");
let bodyparser = require("body-parser");
let jwt = require("./jwt");

module.exports = [
    morgan("dev")
    , bodyparser.json()
    , bodyparser.urlencoded({ extended: true })
    , jwt()
]