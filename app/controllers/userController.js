"use strict";

const { UserModel } = require('../models')
const moment = require('moment-timezone');
const { userService } = require('../services');
const { MESSAGES } = require('../utils/constants');
/**************************************************
***************** user controller ***************
**************************************************/
let controller = {};

/**
* function to get server response.
*/
controller.checkServer = async (req, res) => {
    return res.json({"status_code":200, "msg":MESSAGES.SERVER_IS_WORKING_FINE});
};

/* export controller */
module.exports = controller;
