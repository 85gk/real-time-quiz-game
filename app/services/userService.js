'use strict';
const { UserModel } = require('../models');
const moment = require('moment-timezone');
const { NORMAL_PROJECTION } = require('../utils/constants');

let userService = {};

/** 
* function to register a new  user
*/

userService.createUser = async (payload) => {
    return await UserModel(payload).save();
};

/**
* function to update user.
*/
userService.updateUser = async (criteria, dataToUpdate, projection = NORMAL_PROJECTION) => {
    let updatedUserData = await UserModel.findOneAndUpdate(criteria, dataToUpdate, { new: true, projection: projection });
    return updatedUserData;
};

/**
* function to fetch single user from the system based on criteria.
*/
userService.getUser = async (criteria, projection = NORMAL_PROJECTION) => {
    return await UserModel.findOne(criteria, projection).lean().exec();
};

/**
 * function to get aggregated user data
 */
userService.userAggregate = async (queryArray) => {
    return await UserModel.aggregate(queryArray);
};


module.exports = userService;