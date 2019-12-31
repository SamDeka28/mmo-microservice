//#region ConvertToReturnable
/**
 * @method convertToReturnable
 * @param {object} response - the response object to convert
 * @return returnableResponse
 * @description - Converts the a playersList to an array and removes the unnecessary meta data
 * @memberof Sockets
 */
module.exports = function convertToReturnable(response) {
    let returnableResponse = { ...response.data };
    /**
     * Delete meta data 
     */
    delete returnableResponse.isFilled;
    delete returnableResponse.count;
    delete returnableResponse.spawnablePositions;
    delete returnableResponse.timer_id;
    delete returnableResponse.AICount;
    delete returnableResponse.playerCount;
    delete returnableResponse.room_type;
    delete returnableResponse.track;
    delete returnableResponse.ranks;
    /**
     * Convert object to array entries
     */
    returnableResponse = Object.values(returnableResponse);
    response.data = returnableResponse;
    return response;
}
//#endregion