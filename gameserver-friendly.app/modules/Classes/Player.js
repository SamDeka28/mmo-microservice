const SpawnableConfig = require("../DefaulConfigs/Spawnable.config");

function Players() {
    this.playerId = 0
    this.user_name = ""
    this.socketId = null
    this.room_id = null
    this.animation = "Idle"
    this.speed = 0
    this.lerpTime = 0.1
    this.spawnAt = null
    this.position = []
    this.rotation = 0
    this.isAI = false
    this.direction = 0
    this.checkpoint = 0
    this.rank = 0
}

Players.prototype.addProperty = function (key, value) {
    if (key && typeof key != "string") throw Error("key must be a string");
    this[key] = value;
}

Players.prototype.addProperties = function (properties) {
    if (properties && typeof properties != "object") throw Error("properties must be an object with key value pairs");
    for (const key in properties) {
        this[key] = properties[key];
    }
}

module.exports = Players