let Game = require("../Classes/Game");
let Timer = require("../Classes/Timers");

module.exports = function destroyAI(room_id) {
    /**meta data array */
    const meta = ["isFilled", "count", "spawnablePositions", "timer_id"];
    /**Get current room */
    let currentRoom = Game.currentRoomById(room_id);

    for (const key in currentRoom) {
        if (currentRoom.hasOwnProperty(key) && !meta.includes(key)) {
            const player = currentRoom[key];
            if (player.isAI == true) {
                let timerId = Timer.map[player.playerId];
                if (timerId) {
                    Timer.clearTimer({ timer: timerId });
                }
            }
        }
    }
}