const syncPosition = require("./syncPosition");
const Game = require("../Classes/Game");
const Timer = require("../Classes/Timers");
const { models: { Matches } } = require("../../Utility/helpers");
const { TIMERS_CONST: { AI_SYNC_INTERVAL }, AI_TRACKS } = require("../../Utility/constants");

module.exports = async function (room_id) {
    /**
     * Get all AI players
     */
    let aiPlayers = await getAiPlayers(room_id);

    let totalAiPlayers = aiPlayers.length;
    /**
     * Foreach Player run a simulation timer until the track ends
     */
    let GameRoom = Game.currentRoomById(room_id);

    for (let i = 0; i < totalAiPlayers; i++) {
        let player = aiPlayers[i];
        let playerId = player._id;

        let playerTrackPos = GameRoom[playerId].spawnAt;

        let city = GameRoom.track;

        let trackLength = AI_TRACKS[city][playerTrackPos].data.length;

        let maxDurationToCompleteLap = trackLength * AI_SYNC_INTERVAL;

        Timer.countdowntimer({ key: playerId, interval: AI_SYNC_INTERVAL, endat: maxDurationToCompleteLap }, ({ timer_id }) => {
            let counter = Timer.interval[timer_id]['counter'];
            counter != undefined ? Timer.interval[timer_id]['counter'] += 1 : Timer.interval[timer_id]['counter'] = 0;
            let trackData = AI_TRACKS[city][playerTrackPos];
            let position = trackData.data[counter];
            syncPosition({ ...position, playerId }, _ => { });
        });
    }
}

async function getAiPlayers(room_id) {
    let aiPlayers = await Matches.aggregate([
        { $match: { room_id: room_id } },
        { $unwind: "$players" },
        {
            $lookup: {
                localField: "players",
                foreignField: "_id",
                from: "players",
                as: "player"
            }
        },
        { $unwind: "$player" },
        { $replaceRoot: { newRoot: "$player" } },
        { $match: { mode: "AI" } }
    ]);

    return aiPlayers;
}