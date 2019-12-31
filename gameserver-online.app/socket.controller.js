const { join, SyncPosition, OnDisconnect, LeaveRoom } = require("./modules/Socket");
const jwt = require("jsonwebtoken");
const { jwt: { secret } } = require("./config");
const { SOCKET: { EVENTS } } = require("./Utility/constants")

module.exports = function (io) {
    try {
        io.use(function (socket, next) {
            let token = socket.handshake.query.authToken;
            let decoded = jwt.verify(token, secret);
            if (decoded) {
                socket.user_id = decoded.user_id;
                socket.email = decoded.email;
                socket.user_name = decoded.user_name;
                next();
            }
        })

        io.on("connect", function (socket) {
            socket.on(EVENTS.JOIN, join);
            socket.on(EVENTS.CREATE, join);
            socket.on(EVENTS.SYNC_POSITION, SyncPosition);
            socket.on(EVENTS.DISCONNECT, OnDisconnect)
            socket.on(EVENTS.LEAVE_ROOM, LeaveRoom)
        })
    } catch (error) {
        console.error(error)
    }
}
