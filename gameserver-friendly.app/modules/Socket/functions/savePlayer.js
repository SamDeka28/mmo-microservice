let { helpers: { models: { PlayerMatchStats, Matches, Players } } } = require("../../../Utility");
const mongoose = require("mongoose");
const Game = require("../../Classes/Game");
//#region SavePlayer
/**
 * @method savePlayer
 * @param {object} data
 * @param {object} data.player - The object of the player instance
 * @param {string} data.on_socket - The socket id of the player
 * @param {Boolean} [data.create=false] - If true, create a new match, else add the player to the match based on the 
 * players room_id
 * @description - The method is responsible for create a new match if the create param is set to true, else
 * it will add the player to the match based on the room_id of the player  
 * @memberof Sockets
 */
module.exports = async function savePlayer({ player, on_socket, create = false }) {
    let match = null;
    let playerIsDuplicate = false;
    try {
        if (create) {
            /**
             * Create a new match
             */
            match = await Matches.create({
                room_name: player.room_id
                , room_id: player.room_id
                , room_capacity: Game.allowedPlayers
                , players: [player.playerId]
                , players_count: 1
            });

        } else {
            /**
             * Check if the room is filled or not
             */
            match = await Matches.findOne({ room_id: player.room_id, is_filled: false });
            /**
             * if match exists add player to the match
             */
            if (match) {
                /**
                 * add player only if the room has space
                 */
                if (match.players.hasOwnProperty(player.playerId)) {
                    throw Error("Player already exists");
                }

                let updatable = {}

                if (match.players_count == match.room_capacity - 1) {
                    updatable["$set"] = { 'is_filled': true };
                }

                if (match.players_count < match.room_capacity) {
                    updatable["$push"] = { players: player.playerId };
                    updatable["$inc"] = { players_count: 1 }
                }

                match = await Matches.findOneAndUpdate({ _id: mongoose.Types.ObjectId(match._id) },
                    updatable, { new: true })
            }
        }

        /**
        * if match is created then add the players to the playermatchstats model
        */
        if (match && !playerIsDuplicate) {
            /**
             * create new player stats
             */
            await PlayerMatchStats.create({
                match_id: match._id
                , player_id: player.playerId
                , animation: player.animation
                , speed: player.speed
                , posX: player.posX
                , posZ: player.posZ
                , rotation: player.rotation
            })
            /**
             * Update player's  socket_id
             */
            await Players.findOneAndUpdate({ _id: mongoose.Types.ObjectId(player.playerId) }
                , { $set: { on_socket: on_socket } });
        }
        return { match_id: match._id };
    } catch (error) {
        console.error(error)
    }

}
//#endregion