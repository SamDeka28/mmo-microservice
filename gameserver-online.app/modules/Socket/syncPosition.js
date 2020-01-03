const Game = require("../Classes/Game");
const justifyRanking = require("./functions/justifyRanking");
/**
 * @method syncPosition
 * @param {object} data - the data to sync
 * @param {function} send -  The callback function
 * @description - Sync player's position 
 * @memberof Sockets
 */
module.exports = function syncPosition(data, send) {
    try {
        let { posX, posZ, rotation, speed, direction, lerpTime, checkpoint, playerId } = data;
        playerId = this.user_id || playerId;
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
            playerRoom[playerId].lerpTime = lerpTime;

            /**get Player Ranking */
            let rank = justifyRanking(playerRoom, playerId, room_id, checkpoint);
            playerRoom[playerId].rank = rank;
            /**Current player position broadcast */
            io.to(room_id).emit("RecievePositionSyncBroadcast", { playerId, posX, posZ, rotation, lerpTime: lerpTime, speed, direction, rank })
            send({ rank, status: 200 });
        }
    } catch (error) {
        console.error(error);
    }
}

