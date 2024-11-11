const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require('moment-timezone');

const gameDetailsSchema = new Schema({
    roomId: { type:mongoose.Schema.Types.ObjectId,ref: 'gameProfile' },
    userId: { type:mongoose.Schema.Types.ObjectId,ref: 'user' },
    response: [{
        questionId: { type:mongoose.Schema.Types.ObjectId,ref: 'questions' },
        ans: {type:Number},
    }],
    isCompleted: { type:Boolean, default:false },
    correctAns: { type:Number, default:0},
    isActive: {type:Boolean, default:true}
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('game_details', gameDetailsSchema);
