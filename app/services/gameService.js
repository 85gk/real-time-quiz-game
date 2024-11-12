'use strict';
const moment = require('moment-timezone');
const { NORMAL_PROJECTION } = require('../utils/constants');
const { gameDetails, gameProfileModel, questionModel } = require('../models');

let gameService = {};

/** 
* function to get active room
*/
gameService.createGameProfile = async (payload) => {
    return await gameProfileModel(payload).save();
};

gameService.updateGameProfile = async (roomId, dataToUpdate) => {
    return await gameProfileModel.findOneAndUpdate({ _id: roomId}, dataToUpdate, { new: true });
};

gameService.createGameData = async (payload) => {
    return await gameDetails(payload).save();
};

gameService.updateGameData = async (roomId, dataToUpdate) => {
        return await gameDetails.findOneAndUpdate({roomId: roomId, userId:dataToUpdate.userId}, dataToUpdate, { new: true });
};

gameService.getActiveRoom = async (payload) => {
    return await gameProfileModel.findOne({nParticipants:1, entryFee:payload.entryFee});
}

gameService.getQuestions = async () => {
    return await questionModel.find({isActive:true});
}

gameService.calculateCorrectAns = async (gameProfileData, gameData, questionData) => {
    let correctCount=0;
    for(let i=0;i<gameProfileData.totalQuestions;i++){
        if(gameData.response[i].ans==questionData[i].ans){
            correctCount++;
        }
    }
    return correctCount;
}

module.exports = gameService;