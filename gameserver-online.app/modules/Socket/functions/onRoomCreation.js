const Game = require("../../Classes/Game");
const convertToReturnable = require("./convertToReturnable");
const startTimers = require("./startTimers");
const savePlayer = require("./savePlayer");
const { SOCKET: { EVENTS } } = require("../../../Utility/constants");
/**
 * @method onRoomCreation
 * @description Creates a new room and adds a player to a provided room on the basic of gameType([room_type=enum,[open,closed]) and add the player to the PlayerIdMap.
 * Responds with a callback to the caller and broadcast the PlayerJoined Event
 * -Starts a timer for the match to start emitting RaceCountdownTimer and RaceStarts event
 * -Spawns AI to the game if enableAI is true
 */
module.exports = async function onRoomCreation({ socket, playerId, user_name, gameType, player, on_socket, room, enableAI, track }, send) {
    let room_name = room;
    let { response, addedPlayer } = Game.addPlayer({ socket, room_id: room_name, playerId, user_name, create_room: true, room_type: gameType, track });
    if (response && response.status == 200) {
        Game.PlayerIdMap[playerId] = addedPlayer.room_id;
        let { match_id } = await savePlayer({ player: addedPlayer, on_socket: on_socket, create: true });
        response = convertToReturnable(response);
        startTimers({ room_name, match_id, enableAI, room_type: gameType });
    }
    send(response);
    socket.to(room).emit(EVENTS.PLAYER_JOINED, addedPlayer);
}