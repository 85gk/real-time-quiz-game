'use strict';
let CONSTANTS = {};


CONSTANTS.MESSAGES = require('./messages');


CONSTANTS.SOCKET_EVENTS = {
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    ON_DISCONNECT: "onDisconnect",
    JOIN_ROOM: 'joinRoom',
    PLAY_NOW:'playNow',
    LOAD_GAME: "loadGame",
    USER_CHOICE: 'userChoice',
    GAME_ERROR: 'gameError',
    SEND_QUESTION: 'sendQuestions',
    GAME_OVER: 'gameOver'
}

CONSTANTS.SECURITY = {
    JWT_SIGN_KEY: '1234jumbo234!@#$%^',
    BCRYPT_SALT: 8
};


CONSTANTS.NORMAL_PROJECTION = { __v: 0, isDeleted: 0, createdAt: 0, updatedAt: 0 };

module.exports = CONSTANTS;