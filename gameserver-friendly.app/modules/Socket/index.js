/**
 * @namespace Sockets
 */
let join = require("./join");
let SyncPosition = require("./syncPosition");
let OnDisconnect = require("./onDisconnect");
let LeaveRoom = require("./LeaveRoom");
let RunAiSimulation = require("./runAiSimulation");

module.exports = {
    SyncPosition
    , join
    , OnDisconnect
    , LeaveRoom
    , RunAiSimulation
}