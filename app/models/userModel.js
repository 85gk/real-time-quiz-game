const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require('moment-timezone');

const userSchema = new Schema({
    name:{
        type:String,
    },
    mobileNumber: {
        type:String
    },
    password:{
        type:String
    },
    isActive:{
        type:Boolean,
        default: true
    },
    app_version: { 
        type: String, 
        default: '1.0.0' 
    },
    last_login_at : { 
        type: Date, 
        default: new Date(moment())
    }
},{ timestamps:true })

module.exports = mongoose.model('users', userSchema);    