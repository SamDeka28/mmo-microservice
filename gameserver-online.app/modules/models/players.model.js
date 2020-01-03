let mongoose = require("mongoose");

let PlayerSchema = mongoose.Schema({
    email: { type: String, default: "" }
    , facebook_id: { type: String, default: "" }
    , user_name: { type: String, default: "" }
    , device_id: { type: String, default: "" }
    , password: { type: String, default: "" }
    , status: { type: Number, required: true, default: 1 }
    , is_online: { type: Number, required: true, default: 0 }
    , mode: { type: String, enum: ["Guest", "Facebook", "Normal", "AI"] }
    , created_at: { type: Date, required: true, default: Date.now }
    , modified_at: { type: Date, required: true, default: Date.now }
    , on_socket: { type: String, default: "" }
});

module.exports = mongoose.model("Players", PlayerSchema);