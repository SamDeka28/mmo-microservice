let services = require("../services/players.services");

module.exports.register = async function (req, res) {
    let { body: { device_id, email_id, facebook_id, user_name, password, mode } } = req;
    console.log({ device_id, email_id, facebook_id, user_name, password, mode })
    let response = await services.register({ device_id, email_id, facebook_id, user_name, password, mode });
    res.json(response)
};

module.exports.login = async (req, res) => {
    let { body: { facebook_id, password, email_id } } = req;
    let response = await services.login({ facebook_id, password, email_id });
    res.json(response);
};

module.exports.logout = async (req, res) => {
    let { user: { user_id } } = req;
    let response = await services.logout({ user_id });
    res.json(response);
};