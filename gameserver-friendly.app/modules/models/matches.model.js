let mongoose = require("mongoose");

let MatchesSchema = mongoose.Schema({
    room_name: { type: String, default: "" }
    , room_id: { type: String, default: "" }
    , room_capacity: { type: Number, default: 6 }
    , players_count: { type: Number, default: 0 }
    , players: [{ type: mongoose.Schema.Types.ObjectId, ref: "Players" }]
    , is_filled: { type: Boolean, default: false }
    , match_started: { type: Boolean, default: false }
    , match_ended: { type: Boolean, default: false }
    , match_started_at: { type: Date, default: Date.now() }
    , match_ended_at: { type: Date }
});

module.exports = mongoose.model("Matches", MatchesSchema);