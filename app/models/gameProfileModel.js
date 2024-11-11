const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require('moment-timezone');

const gameProfileModel = new Schema({
    host: { type:mongoose.Schema.Types.ObjectId,ref: 'User' },
    entryFee: { type: Number },
    nParticipants: { type:Number },
    players: [{
        userId: { type:mongoose.Schema.Types.ObjectId,ref: 'User' },
        name: { type: String, default:''},
        seatNumber: { type: Number, deafult: -1},
        isOnline: { type: Boolean, default: false },
        lastSeen: { type: Date , default: new Date(moment()) }
    }],
    contestCode:{ type:String, index: true},  
    isActive: { type: Boolean, default:true , index:true},
    winner: {type: mongoose.Schema.Types.ObjectId,ref: 'User', default:null},
    winningAmount: { type:Number, default:0}, 
    resultDeclaredReson: {type:Number, default:0}, //1->normal win/loss, 2->draw
    gameStartTime: { type: Date , default: new Date(moment())},
    gameEndTime: { type: Date },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('jumbogameProfile', gameProfileModel );  
