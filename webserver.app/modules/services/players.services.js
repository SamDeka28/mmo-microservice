/**
 * @namespace Players
 */
let { functions: { success, failed } } = require("../../Utility");
let { helpers: { models: { Players } } } = require("../../Utility");
let { bcrypt: { salt_round }, jwt: { secret } } = require("../../config");
let jwt = require("jsonwebtoken");
let bcrypt = require("bcryptjs");
let mongoose = require("mongoose");
/**
 * @method register
 * @param {string} device_id - The device id
 * @param {string} email_id - The email id of the user retrieved by the client from facebook
 * @description Register a user as a guest if email_id is not provided else register as a user
 * @return {Response}
 * @memberof Players
 */
module.exports.register = async function ({ device_id, email_id, facebook_id, user_name, password }) {
    try {
        let guestExists = await Players.findOne({ device_id: device_id, mode: "Guest" });
        /** If player doesn't exist then create one */
        let playerInfo = {
            device_id: device_id
        }
        let message = "";
        let player = null;

        if (!device_id) {
            return failed("Device id is required");
        }

        if ((user_name || email_id || password || facebook_id) && device_id) {
            if (!user_name) return failed("username is required");
            if (!email_id) return failed("email_id is required");
            playerInfo['user_name'] = user_name;
            playerInfo["email"] = email_id;

            /**Check if user with same email already exists*/
            let emailExists = await Players.count({ email: email_id });
            if (emailExists) {
                return failed("User with same email id exists")
            }
            /**
             * facebook login 
             * #requires facebook_id and device id
             */
            if (facebook_id) {
                playerInfo['mode'] = "Facebook";
                playerInfo['facebook_id'] = facebook_id;
                message = "Successfully linked with facebook";
            }
            /**
             * Normal authentication
             * #requires email_id, user_name and password
             */
            if ((email_id || user_name) && password) {
                password = String(password);
                if (!password) return failed("password is required");
                if (!email_id) return failed("email_id is required");
                let hash = bcrypt.hashSync(password, salt_round);
                playerInfo['password'] = hash;
                playerInfo['mode'] = "Normal"
                message = "Successfully registerd"
            }
            if (guestExists) {
                player = await Players.findOneAndUpdate({ device_id: device_id }, {
                    $set: playerInfo
                }, { upsert: true, new: true });
            } else {
                player = await Players.create(playerInfo);
            }
            return success(message, player);
        } else {
            if (!guestExists) {
                let username = `LRGUEST${Math.floor(Math.random() * (+1000 - +9999) + +1000)}`; //Random user name
                playerInfo['user_name'] = username;
                playerInfo['mode'] = "Guest";
                player = await Players.create(playerInfo);
                let token = jwt.sign({ user_id: player._id, email: null, user_name: player.user_name }, secret);
                return success("Logged in as a guest user", { user_id: player._id, token: token });
            } else {
                let token = jwt.sign({ user_id: guestExists._id, email: null, user_name: guestExists.user_name }, secret);
                return success("Logged in as a guest user", { user_id: guestExists._id, token: token });
            }

        }
    } catch (error) {
        console.error(error)
        return failed("Something went wrong", error);
    }
}

/**
 * @method login
 * @param {object} data
 * @param {string} facebook_id The facebook id in case of facebook login
 * @param {string} password The password in case of normal login
 * @param {string} email_id The email id in case of normal login
 * @description The method handles both facebook and normal login. In case of `Normal Login`, the email_id
 * and password must be passed. In case of `Facebook Login`, only the facebook id is to be passed
 * @return {Response}
 * @memberof Players
 */
module.exports.login = async function ({ facebook_id, password, device_id, email_id }) {
    try {
        let condition = {}
        let token = null;
        /**if signin in using facebook */
        if (facebook_id) {
            condition['facebook_id'] = facebook_id;
        }
        /**if signin in using normal credentials */
        if (email_id && password) {
            condition['email'] = email_id;
        }

        let user = await Players.findOne(condition);
        if (user) {
            /** In case of normal login, password is compared with the hash stored in the database
             *  and a token is generated */
            if (email_id && password) {
                password = String(password);
                let isPasswordValid = bcrypt.compareSync(password, user.password);
                if (isPasswordValid) {
                    /**Update the device id of the user*/
                    user.device_id = device_id;
                    await user.save();
                    /** Generate a token */
                    token = jwt.sign({ user_id: user._id, email: user.email, user_name: user.user_name }, secret);
                    return success("Successfully logged in", {
                        user_id: user._id
                        , token: token
                    })
                } else {
                    return failed("Wrong credentials")
                }
            }
            /** In case of facebook login, a new token is generated */
            if (facebook_id) {
                /**Update user's device id */
                user.device_id = device_id;
                await user.save();
                /**Generate token */
                token = jwt.sign({ user_id: user._id, user_name: user.user_name, facebook_id: user.facebook_id }, secret);
                return success("Successfully logged in using facebook");
            }
            return failed("Wrong credentials")
        } else {
            return failed("Wrong credentials")
        }

    } catch (error) {
        console.error(error);
        return failed("Couldn't log in", error);
    }
}


/**
 * @method logout
 * @param {object} data
 * @param {string} data.user_id - The id of the logged out user
 * @description The method is responsible for destroying the user's session by resetting the device token
 * @memberof Players
 */
module.exports.logout = async function ({ user_id }) {
    try {
        await Players.findOneAndUpdate({ _id: mongoose.Types.ObjectId(user_id) }, {
            $set: { device_id: null }
        });
        return success("User successfully logged out");
    } catch (error) {
        console.error(error);
        return failed("Something happened", error);
    }
}