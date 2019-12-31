/**@namespace Timers */
const uuid = require("uuid/v1");

const Timers = function () {
    this.interval = {}
    this.timeout = {}
    this.map = {}
}

/**
 * @method countdowntimer
 * @param {object} data 
 * @param {string} [data.key] - optional key that can be provided for a countdowntimer. If provided, registers the countdowntimer
 * to the Timermap
 * @param {number} [data.interval=1] Set the interval of the countdowntimer. Defaults to 1sec. The value is given in seconds.
 * @param {number} data.endat The duration of the countdown timer.
 * @param {function} callback The callback function that executes at each interval. The callback parameters are `{elapsed,timer_id,key}`
 * @description - The function is responsible for starting a countdown timer
 * @return timerId
 * @memberof Timers
 */
Timers.prototype.countdowntimer = function ({ key, interval, endat }, callback) {
    let timerId = uuid();
    interval = interval != undefined ? interval * 1000 : 1000;

    this.interval[timerId] = {}
    this.interval[timerId]['elapsed'] = endat;
    /**Add timer to map */
    key ? this.map[key] = timerId : null;
    /**Start the timer */
    this.interval[timerId]["instance"] = setInterval(() => {
        let elapsed = this.interval[timerId].elapsed;
        if (elapsed >= 0) {
            callback({ elapsed: elapsed, timer_id: timerId, key: key });
            this.interval[timerId].elapsed -= interval / 1000;
        } else {
            this.clearTimer({ timer: timerId });
        }
    }, interval);

    return timerId;
}

/**
 * @method map
 * @param {object} data
 * @param {string} data.key - A key for the timerId mapping
 * @param {string} data.timerId - The timerId
 * @description - Given a key and a timerId, registers itself to the TimerId map which can be then used to clear the timeout
 * easily using the key registered against the timerId
 * @returns map
 * @memberof Timers
 */
Timers.prototype.map = function ({ key, timerId }) {
    return this.map[key] = timerId;
}

/**
 * @method clearTimer
 * @param {object} data
 * @param {string} data.timer - The timerId or the key of the timer to destroy
 * @description - The function checks for a given timer and clear the timer accordingly
 * @memberof Timers
 */
Timers.prototype.clearTimer = function ({ timer }) {
    let timerId = this.map.hasOwnProperty(timer) ? this.map[timer] : timer;
    let timerInstance = null;
    if (this.interval.hasOwnProperty(timerId)) {
        timerInstance = this.interval[timerId].instance;
        clearInterval(timerInstance);
        delete this.interval[timerId];
    } else if (this.timeout.hasOwnProperty(timerId)) {
        timerInstance = this.timeout[timerId].instance;
        clearTimeout(timerInstance);
        delete this.timeout[timerId];
    } else {
        throw Error(`No timer exist with timerId ${timer}`)
    }
}

module.exports = new Timers();