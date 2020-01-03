let Players = require("../modules/models/players.model");
let Matches = require("../modules/models/matches.model");
let PlayerMatchStats = require("../modules/models/playermatchstats.model");
let jwt = require("./jwt");
module.exports = {
    models: {
        Players, Matches, PlayerMatchStats
    },
    jwt
}