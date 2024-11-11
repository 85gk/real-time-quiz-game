const { MESSAGES } = require('../utils/constants');
const { UserModel } = require('../models');
const { hashPassword, compareHash, encryptJwt, decryptJwt } = require("../utils/commonFunction")
const moment  = require('moment-timezone')
let authService = {};

/** -- function to authenticate socket token */
authService.socketAuthentication = async (socket, next) => {    
    try {
        const authHeader = socket.handshake.query.authorization;
        const token = authHeader && authHeader.split(' ')[1]
        const decoded = decryptJwt(token)
        const user = await UserModel.findOne({ _id: decoded._id, isActive: true }).lean().exec();
        if (user) {
            socket.user = user;
            let userId = user._id.toString();
            socket.id = userId;
            return next();
        }
        else {
            return next({success: false, message: MESSAGES.UNAUTHORIZED});
        }
    }
    catch (err) {
        console.log("error", err)
        return next({success: false, message: MESSAGES.SOMETHING_WENT_WRONG});
    }
};

const isValidIndianMobile = (mobile) => {
    const indianMobileRegex = /^[6-9]\d{9}$/;
    return indianMobileRegex.test(mobile);
};

/**
 * Login with phone number
 */
authService.register = async (req, res) => {
    try {
        let { mobileNumber , password}  = req.body;
        if(mobileNumber=='' || mobileNumber==undefined || mobileNumber==null){
            return res.json({ status: false, response_code: 400, message: "mobile number is required." });
        }
		if(password=='' || password==undefined || password==null){
            return res.json({ status: false, response_code: 400, message: "valid password is required." });
        }

        if (isValidIndianMobile(mobileNumber)){
            let name = '+91xxxxxxxx'+`${mobileNumber[8]}`+`${mobileNumber[9]}`;
            let completeMobileNumber = "+91"+`${mobileNumber}`
            let alreadyRegisteredUser = await UserModel.findOne({ mobileNumber: completeMobileNumber }).lean().exec();
            if(!alreadyRegisteredUser){
				const hashedPassword = hashPassword(password);
                let userData = {
                    name: name,
                    mobileNumber: completeMobileNumber,
                    password: hashedPassword
                };
                userData = await UserModel(userData).save();
            } else {
                return res.json({ status: false, response_code: 400, message: "mobile number is already registered." });
            }
            return res.json({ status: true, response_code: 200, message: "You have been register successfully." });
        } else {
            return res.json({ status: false, response_code: 400, message: "mobile number is not valid." });
        }
    } catch (error) {
        console.log(error)
        return res.json({ status: false, response_code: 400, message: "something went wrong." });
    }
}

/**
 * verify otp
 */
authService.login = async (req, res) => {
    try {
		const { mobileNumber, password } = req.body;
		if(!mobileNumber){
            return res.json({ status: false, response_code: 400, message: "mobile number is required." });
        }
        if(!password){
            return res.json({ status: false, response_code: 400, message: "password is required." });
        }
		let completeMobileNumber = "+91"+`${mobileNumber}`
		const user = await UserModel.findOne({ mobileNumber: completeMobileNumber });
		if(!user){
			return res.json({ status: false, response_code: 400, message: "You have not registered yet." });
		}
		const passwordMatch =  compareHash(password, user.password);
		if (!passwordMatch) {
			return res.json({ status: false, response_code: 400, message: "Login credential not correct." });
		}
		let payload = { _id: user._id, last_login_at: new Date(moment()) };
		let token = encryptJwt(payload);
		return res.json({ status: true, response_code: 200, message: "You have been login Successfully", JWT: token });
    } catch (error) {
        console.log(error);
        return res.json({ status: false, response_code: 400, message: "something went wrong." });
    }
}

module.exports = authService;