const Game = require("../Classes/Game");
let { functions: { success, failed } } = require("../../Utility");

/**
 * @method syncAiPosition
 * @param {object} data - the data to sync
 * @description - Sync player's position 
 * @memberof Sockets
 */
module.exports = function syncAiPosition(data, send) {
    try {
        let { posX, posZ, rotation, speed, direction, playerId } = data;
        let room_id = Game.PlayerIdMap.hasOwnProperty(playerId) ? Game.PlayerIdMap[playerId] : null;

        if (room_id == null) throw Error("Player not associated with any room");

        let playerRoom = Game.Rooms[room_id];
        if (typeof playerId == "undefined" || playerId == undefined) {
            return
        }
        if (playerRoom.hasOwnProperty(playerId)) {
            playerRoom[playerId].posX = posX;
            playerRoom[playerId].posZ = posZ;
            playerRoom[playerId].rotation = rotation;
            playerRoom[playerId].speed = speed;
            playerRoom[playerId].direction = direction;

            /**Current player position broadcast */
            io.to(room_id).emit("RecievePositionSyncBroadcast", { playerId, posX, posZ, rotation, speed, lerpTime: 0.5, direction })

            send(JSON.stringify(playerRoom));
        }
    } catch (error) {
        console.error(error);
    }
}