let services = require("../services/game.service");

module.exports.fetchRooms = async function (req, res) {
    let response = await services.fetchRooms();
    res.json(response);
};

module.exports.getGameRoutes = async function (req, res) {
    let response = services.getGameRoutes();
    res.json(response);
}