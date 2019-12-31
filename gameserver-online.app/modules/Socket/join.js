let { functions: { failed } } = require("../../Utility");
const Game = require("../Classes/Game");
const onRoomCreation = require("./functions/onRoomCreation");
const onPlayerJoin = require("./functions/onPlayerJoin");

//#region Join
/**
 * @method join
 * @param {object} data 
 * @param {string} data.room The room id to join (if user is not opting to create a room, instead join a previously created room)
 * @param {string} data.player_id The id of the player to join
 * @description - The method handles  matchmaking. If a room id is provided, lookup for a existing game and join the player 
 * to that room. If the room id is not provided (`create`), create a room a wait for `30 seconds` for users to join the room
 * @listens join
 * @memberof Sockets
 */
module.exports = async function join({ room, playerId, track = "PARIS" }, send) {
    let on_socket = this.id;
    let user_name = this.user_name;
    let player = null;
    let gameType = "open";

    try {
        let openRoom = Game.getOpenRooms();
        if (openRoom) {
            let { exists, isCreated } = Game.roomExists(openRoom);
            /**Player join a existing room */
            if (!exists && !isCreated) {
                await onRoomCreation({
                    socket: this, playerId, user_name, gameType, player, on_socket, room: openRoom, enableAI: true, track
                }, send);
            } else if (exists) {
                await onPlayerJoin({
                    socket: this, room: openRoom, playerId, user_name, gameType, player, on_socket
                }, send);
            }
        }
    } catch (error) {
        return failed("Unable to add player", error);
    }
}
