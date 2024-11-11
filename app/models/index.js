'use strict';

const questionModel = require('./questionModel');

/********************************
 **** Managing all the models ***
 ********* independently ********
 ********************************/
module.exports = {
    UserModel: require('./userModel'),
    gameDetails: require('./gameModel'),
    questionModel: require('./questionModel'),
    gameProfileModel: require('./gameProfileModel'),
};