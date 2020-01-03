let { models: { PlayerMatchStats, Matches } } = require("../../Utility/helpers");
const mongoose = require("mongoose");
let Game = require("../Classes/Game");
let Timer = require("../Classes/Timers");
let destroyAI = require("../Socket/destroyAI");
/**
 * @method onDisconnect
 * @description - Saves the state of the player on disconnection
 * @memberof Sockets
 */
module.exports = async function onDisconnect() {
    let socket_id = this.id;
    /**Get player id using socket id */
    let playerInfo = await Matches.aggregate([
        {
            $lookup: {
                localField: "players",
                foreignField: "_id",
                from: "players",
                as: "players"
            }
        },
        { $unwind: "$players" },
        { $match: { "players.on_socket": socket_id } },
        { $project: { player_id: "$players._id", room_name: 1, room_id: 1 } },
        { $sort: { "_id": -1 } },
        { $limit: 1 }
    ]);

    if (playerInfo && Array.isArray(playerInfo) && playerInfo.length) {
        /**Get game state of the player */
        playerInfo = playerInfo[0];

        let room_id = playerInfo.room_id

        let playerState = Game.getPlayerState(playerInfo.player_id, room_id);

        /**
         * On disconnect decrease the room count
         */
        Game.Rooms[room_id].count = Game.Rooms[room_id].count - 1;
        Game.Rooms[room_id].playerCount = Game.Rooms[room_id].playerCount - 1;
        /**
         * Check if room is empty,  if yes destroy the room
         */

        if (Game.Rooms[room_id].playerCount == 0) {
            /** Stop the running timer for the match*/
            let runningTimer = Game.Rooms[room_id].timer_id;
            if (Timer.interval.hasOwnProperty(runningTimer)) {
                Timer.clearTimer({ timer: runningTimer });
            }
            /**Destroy all the AIs */
            destroyAI(room_id);
            /**if room is not filled with real player, then destroy AI timers and make room empty */
            this.leave(room_id);
            /**delete the match */
            await Matches.findOneAndRemove({ room_id: room_id, match_started: false });
        } else {
            let spawnAt = Game.Rooms[room_id][this.user_id].spawnAt;
            Game.Rooms[room_id].spawnablePositions.push(spawnAt);
        }

        /**
         * Update current progress of the player
         */
        await PlayerMatchStats.findOneAndUpdate({ player_id: mongoose.Types.ObjectId(playerInfo.player_id) }, {
            $set: {
                animation: playerState.animation
                , speed: playerState.speed
                , position: playerState.position
                , rotation: playerState.rotation
                , direction: playerState.direction
                , score: playerState.score
            }
        });
    }
}