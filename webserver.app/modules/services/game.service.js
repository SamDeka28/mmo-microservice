let { helpers: { models: { Matches } } } = require("../../Utility/index");
let { functions: { success, failed } } = require("../../Utility");

/**
 * @module fetchRooms
 * @description Fetch available rooms
 * @return {Response}
 */
module.exports.fetchRooms = async function () {
    try {
        let availableRoomList = await Matches.find({ is_filled: false, match_started: false }, { room_name: 1, room_id: 1, _id: 1 })
            .sort({ _id: -1 });
        let roomsInSocket = await getGameServerRooms(availableRoomList);

        return success("Successfully retrieved available rooms", roomsInSocket);
    } catch (err) {
        console.error(err);
        return failed("Failed to retrieve Room list", err);
    }
}

/**
 * @todo Implement Room listing functionality
 * Step : 
 * - Hit Game Server Api call for getting the available rooms
 * - Compare the room are available for adding additional players or the room is close
 * - return the rooms
 */
function getGameServerRooms(availableRoomList) {
    /**Check if room exists in the Socket object */
    let roomsInSocket = Object.keys(io.sockets.adapter.rooms);
    /** Match availableRoomList with roomInSocket */
    return availableRoomList.filter(rooms => roomsInSocket.includes(rooms.room_id) ? true : false);

}

module.exports.getGameRoutes = function () {
    return success("Routes fetched succesfully", {
        online: "http://192.168.1.219:3002/",
        friendly: "http://192.168.1.219:3001/"
    });
}