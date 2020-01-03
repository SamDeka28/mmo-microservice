const Game = require("../../Classes/Game");
const Checkpoints = require("../../DefaulConfigs/Checkpoints.config");

module.exports = function justifyRank(playerRoom, playerId, room_id, checkpoint) {
    if (!playerRoom) throw Error("Player room cannot be undefined");
    let city = playerRoom.track;
    let checkPoints = Checkpoints[city];
    let player = playerRoom[playerId];
    let playerCheckpoint = player.checkpoint;
    let distanceCurrent = getPlayerDistance(player, checkPoints, playerCheckpoint);

    if (checkpoint > playerCheckpoint) {
        player.checkpoint += 1;
    }
    let playerRank = playerRoom['ranks'];
    /**find player rank index */
    let rankIndex = playerRank.findIndex(player => { if (player.playerId == playerId) { return true } });
    let thisPlayerRank = playerRank[rankIndex];
    thisPlayerRank.distance = distanceCurrent;
    thisPlayerRank.checkpoint = player.checkpoint;
    /**Sort playerRanks */
    return rearrangeRanks(playerRank, room_id, playerId)
}

function getPlayerDistance(player, checkPoints, playerCheckpoint) {
    let { abs, sqrt } = Math;
    let { posZ } = player;
    let { z: checkpointZ } = checkPoints[playerCheckpoint];
    let deltaZ = abs(checkpointZ - posZ);
    let playerDistanceFromCheckpoint = sqrt(deltaZ);
    return playerDistanceFromCheckpoint;
}

function rearrangeRanks(ranks, room_id, playerId) {
    /**Sort the ranks */
    ranks.sort(function (a, b) {
        let bool = false;
        if (a.checkpoint > b.checkpoint) {
            bool = true;
        }
        else if (a.checkpoint == b.checkpoint && a.distance > b.distance) {
            bool = true;
        }
        return bool ? -1 : 1;
    });

    Game.Rooms[room_id]["ranks"] = ranks;

    /**Get the playerRank */
    let rank = ranks.findIndex((player) => {
        if (player.playerId == playerId) return true
    });

    return rank + 1;
}