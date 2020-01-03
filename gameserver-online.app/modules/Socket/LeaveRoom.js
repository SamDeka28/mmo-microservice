let Game = require("../Classes/Game");
let Timer = require("../Classes/Timers");
let { functions: { success } } = require("../../Utility");
let destroyAI = require("./destroyAI");

module.exports = function ({ room_id }, send) {
    Game.Rooms[room_id].count = Game.Rooms[room_id].count - 1;
    Game.Rooms[room_id].playerCount = Game.Rooms[room_id].playerCount - 1;

    let runningTimer = Game.Rooms[room_id].timer_id;
    if (Timer.interval.hasOwnProperty(runningTimer)) {
        Timer.clearTimer({ timer: runningTimer });
    }
    if (Game.Rooms[room_id].playerCount > 0) {
        let spawnAt = Game.Rooms[room_id][this.user_id].spawnAt;
        Game.Rooms[room_id].spawnablePositions.push(spawnAt);
    } else {
        destroyAI(room_id)
    }

    this.leave(room_id);
    send(success(`You left room ${room_id}`));
}

