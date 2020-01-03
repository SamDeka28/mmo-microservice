let mongoose = require("mongoose");

let PlayerMatchStats = mongoose.Schema({
    match_id: { type: mongoose.Schema.Types.ObjectId, ref: "Matches" }
    , player_id: { type: mongoose.Schema.Types.ObjectId, ref: "Players" }
    , score: { type: Number, default: 0 }
    , animation: { type: String, default: "" }
    , speed: { type: Number }
    , direction: { type: Number }
    , posX: { type: Number }
    , posZ: { type: Number }
    , rotation: { type: Number }
});

module.exports = mongoose.model("PlayerMatchStats", PlayerMatchStats);