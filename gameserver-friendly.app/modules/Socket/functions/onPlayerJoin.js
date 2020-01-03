const Game = require("../../Classes/Game");
const convertToReturnable = require("./convertToReturnable");
const savePlayer = require("./savePlayer");
const { SOCKET: { EVENTS } } = require("../../../Utility/constants");
/**
 * @method onPlayerJoin
 * @description Adds a player to a provided room on the basic of gameType([room_type=enum,[open,closed]) and add the player to the PlayerIdMap.
 * Also adds the player to the Match schema. Responds with a callback to the caller and broadcast the PlayerJoined Event 
 */
module.exports = async function onPlayerJoin({ socket, room, playerId, user_name, gameType, player, on_socket }, send) {
    let { response, addedPlayer } = Game.addPlayer({ socket, room_id: room, playerId, user_name, room_type: gameType });
    if (response && response.status == 200) {
        Game.PlayerIdMap[playerId] = addedPlayer.room_id;
        await savePlayer({ player: addedPlayer, on_socket: on_socket });
        response = convertToReturnable(response);
    }
    send(response);
    socket.to(room).emit(EVENTS.PLAYER_JOINED, addedPlayer);
}