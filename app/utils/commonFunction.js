let CONSTANTS = require('./constants');
const MONGOOSE = require('mongoose');
const BCRYPT = require("bcrypt");
const JWT = require("jsonwebtoken");
const moment = require('moment-timezone');

let commonFunctions = {};

/**
* incrypt password in case user login implementation
*/

commonFunctions.hashPassword = (payloadString) => {
    return BCRYPT.hashSync(payloadString, CONSTANTS.SECURITY.BCRYPT_SALT);
};

/** compare hash */
commonFunctions.compareHash = (payloadPassword, userPassword) => {
    return BCRYPT.compareSync(payloadPassword, userPassword);
};

/** create jsonwebtoken **/
commonFunctions.encryptJwt = (payload) => {
    let token = JWT.sign(payload, CONSTANTS.SECURITY.JWT_SIGN_KEY, { algorithm: 'HS256', expiresIn: '365d' });
    return token;
};

commonFunctions.decryptJwt = (token) => {
    return JWT.verify(token, CONSTANTS.SECURITY.JWT_SIGN_KEY, { algorithm: 'HS256' })
}

module.exports = commonFunctions;

