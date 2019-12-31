const Players = require("./Player");
const spawnablePositions = require("../DefaulConfigs/Spawnable.config")
let { functions: { success, failed } } = require("../../Utility");
const { GAME: { MAX_PLAYER } } = require("../../Utility/constants");

function Game({ maxPLayers }) {
    this.Rooms = {};
    this.AvailableRoom = [];
    this.RoomCount = 0;
    this.Weapons = [];
    this.openRooms = null;
    this.allowedPlayers = maxPLayers || 100;
    this.PlayerIdMap = {};
    this.room = this.AvailableRoom.length ? this.AvailableRoom[0] : false;
}

Game.prototype.addPlayer = function ({ socket, room_id, playerId, user_name, create_room = false, isAI = false, room_type, track }) {
    if (this.Rooms.hasOwnProperty(room_id) && this.Rooms[room_id].hasOwnProperty(playerId)) throw Error("Player already exists");

    let player = new Players();

    if (!create_room) {
        if (!this.Rooms.hasOwnProperty(room_id)) {
            return failed("No such room exists");
        }
    }

    this.RoomCount = Object.keys(this.Rooms).length;
    player.socketId = socket.id;
    player.room_id = room_id;
    player.playerId = playerId;
    player.user_name = user_name;
    player.isAI = isAI;

    if (this.Rooms.hasOwnProperty(room_id) && this.currentRoomById(room_id).count >= this.allowedPlayers) {
        this.Rooms[room_id]['isFilled'] = true;
    }
    if (this.Rooms.hasOwnProperty(room_id) && this.currentRoomById(room_id).isFilled == true) {
        this.openRooms = null;
        return failed("No space left in the room");
    }

    if (this.Rooms.hasOwnProperty(room_id)) {
        player.spawnAt = this.spawnPlayerAtRandom(room_id);
        this.Rooms[room_id]['count'] += 1;
        if (this.Rooms[room_id]['count'] == this.allowedPlayers) {
            this.Rooms[room_id]["isFilled"] = true;
            this.openRooms = null;
        }
        isAI ? this.Rooms[room_id]['AICount'] += 1 : this.Rooms[room_id]['playerCount'] += 1;
        this.Rooms[room_id][player.playerId] = player;
        this.Rooms[room_id]['ranks'].push({ playerId, checkpoint: 0, distance: 0 });
        socket.join(room_id);
    } else {
        this.room = room_id;
        this.Rooms[room_id] = { isFilled: false, count: 0, AICount: 0, playerCount: 0, spawnablePositions: [...spawnablePositions], room_type: room_type };
        this.Rooms[room_id]['ranks'] = [{ playerId, checkpoint: 0, distance: 0 }]
        this.Rooms[room_id]['track'] = track;
        player.spawnAt = this.spawnPlayerAtRandom(room_id);
        this.Rooms[room_id][player.playerId] = player;
        this.Rooms[room_id]['count'] += 1;
        isAI ? this.Rooms[room_id]['AICount'] += 1 : this.Rooms[room_id]['playerCount'] += 1;
        socket.join(room_id);
    }

    return {
        response: success(`Joined room ${room_id}`, this.currentRoomById(room_id))
        , addedPlayer: player
        , allPlayers: this.currentRoomById(room_id)
    };
}

Game.prototype.spawnPlayerAtRandom = function (room_id) {
    let playerRoom = this.currentRoomById(room_id);
    let randomIndexOfSpawnablePostion = Math.floor(Math.random() * playerRoom.spawnablePositions.length);
    let position = playerRoom.spawnablePositions.splice(randomIndexOfSpawnablePostion, 1);
    return position[0];
}

Game.prototype.currentRoom = function () {
    return this.Rooms[this.room];
}

Game.prototype.setMaxPlayers = function (max_players) {
    this.allowedPlayers = max_players;
}

Game.prototype.currentRoomById = function (room_id) {
    if (this.Rooms.hasOwnProperty(room_id)) {
        return this.Rooms[room_id];
    }
    throw Error("No such room found");
}

Game.prototype.removeRoom = function (roomId) {
    io.sockets.clients(roomId).forEach(function (s) {
        s.leave(roomId);
    });
}

Game.prototype.getPlayerState = function (player_id, room_id) {
    if (!player_id) throw Error("player_id must be defined");
    if (!room_id) throw Error("room_id must be defined");
    let player = null;
    let RoomInfo = this.currentRoomById(room_id);
    if (RoomInfo) {
        player = RoomInfo[player_id]
    }
    return player
}

Game.prototype.getOpenRooms = function () {
    let room_id = Math.random().toString(36).substring(8).toUpperCase();
    if (this.openRooms == null) {
        this.openRooms = room_id;
    }
    return this.openRooms;
}

Game.prototype.roomExists = function (room_id) {
    let exists = false, isCreated = false, isFilled = false;
    if (this.Rooms.hasOwnProperty(room_id)) {
        let room = this.Rooms[room_id];
        exists = true;
        isCreated = room['timer_id'] ? true : false;
        isFilled = room['isFilled'] || false;
    }
    return { exists, isCreated, isFilled }
}
module.exports = new Game({ maxPLayers: MAX_PLAYER });