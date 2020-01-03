let { helpers: { models: { Matches, Players } } } = require("../../../Utility");
const mongoose = require("mongoose");
const Game = require("../../Classes/Game");
const TIMERS = require("../../Classes/Timers");
const runAiSimulation = require("..//runAiSimulation");
const savePlayer = require("./savePlayer");
const { SOCKET: { EVENTS }, TIMERS_CONST, AI_NAMES } = require("../../../Utility/constants");
/**
 * Start game timers for joining and match start on creation of a new room
 */
module.exports = function startTimers({ room_name, match_id, enableAI, room_type }) {
    let JoiningCountDown = room_type == "open" ? TIMERS_CONST.JOINING_COUNTDOWN_TIMER_OPEN_ROOM : TIMERS_CONST.JOINING_COUNTDOWN_TIMER_END;
    TIMERS.countdowntimer({ endat: JoiningCountDown }, async function ({ elapsed, timer_id }) {
        /**Update game timer id*/
        Game.Rooms[room_name]['timer_id'] = timer_id;
        /** Emit joining countdown timer */
        io.to(room_name).emit(EVENTS.JOINING_COUNTDOWN, { elapsed });
        /** If the timer reaches 0 them emit the StartMatch event and start RaceCountDownTimer*/
        if (elapsed == 2 && enableAI == true && (Game.currentRoomById(room_name) || {}).isFilled != true) {
            await aiJustifier(room_name);
        }
        if (elapsed <= 0) {
            /** Emit start match */
            io.to(room_name).emit(EVENTS.START_MATCH, { start: true });
            /** Once joining countdown timer ends, start RaceStartCountdownTimer*/
            TIMERS.countdowntimer({ endat: TIMERS_CONST.RACE_COUNTDOWN_TIMER_END }, async function ({ elapsed, timer_id }) {
                Game.Rooms[room_name]['timer_id'] = timer_id;
                /** Emit  race countdown timer*/
                io.to(room_name).emit(EVENTS.RACE_START_COUNTDOWN, { elapsed });
                if (elapsed <= 0) {
                    /**Emit start race  */
                    io.to(room_name).emit(EVENTS.START_RACE, { start: true });
                    /** Run AI simulation*/
                    if (enableAI == true) {
                        runAiSimulation(room_name);
                    }
                    /**Send trigger to client for refreshing game room list*/
                    io.emit(EVENTS.REFRESH_GAME_ROOM_LIST, { refresh: true });
                    /**Set is_filled property of the Match to true*/
                    await Matches.findOneAndUpdate({ _id: mongoose.Types.ObjectId(match_id) }, {
                        $set: { is_filled: true, match_started: true }
                    });
                }
            });
        }
    });
}

//#endregion


async function aiJustifier(room_name) {
    /**
     * Get number of players in the room
     */
    let { count } = Game.currentRoomById(room_name);

    if (count < Game.allowedPlayers) {
        for (let i = count; i < Game.allowedPlayers; i++) {
            await createAIPlayer(room_name)
        }
        Game.Rooms[room_name].isFilled = true;
    }
}

async function createAIPlayer(room_id) {
    try {
        /**Get a random Name for user */
        let user_name = AI_NAMES[Math.round(Math.random() * AI_NAMES.length - 1)];
        let aiPlayer = await new Players({
            user_name: user_name
            , mode: "AI",
        }).save();

        let { response, addedPlayer } = Game.addPlayer({ socket: { join: () => { } }, room_id, playerId: String(aiPlayer._id), user_name: aiPlayer.user_name, isAI: true });

        if (response && response.status == 200) {
            /**
            * Add player to The PlayerIdMap
            */
            Game.PlayerIdMap[addedPlayer.playerId] = addedPlayer.room_id;
            /**
            * Add the player to the provided room if space is left withing it
            */
            await savePlayer({ player: addedPlayer, on_socket: '' });
        }
        /**
        * Set the returnable response
        */
        io.to(room_id).emit(EVENTS.PLAYER_JOINED, addedPlayer);

    } catch (err) {
        console.log(err)
    }
}
