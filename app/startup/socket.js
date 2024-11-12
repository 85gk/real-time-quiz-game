/** -- import all modules */
const { authService, gameService } = require("../services");
const { MESSAGES, SOCKET_EVENTS } = require("../utils/constants");
const uniqid = require('uniqid');
const moment = require('moment-timezone');
const redis_service = require('./db_redis')

/** -- initialize */
let socketConnection = {};

socketConnection.connect = function (io) {
    io.use(authService.socketAuthentication);
    io.on('connection', async (socket) => {
        socket.use((packet, next) => {
            console.log("Socket hit recieved:=>", packet);
            next();
        });

        socket.emit(SOCKET_EVENTS.CONNECTION, { isConnected: true });

        /** socket disconnect event. */
        socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
            socket.emit(SOCKET_EVENTS.ON_DISCONNECT, {msg: `user ${socket.id} is not Active now ` });
        });

        socket.on(SOCKET_EVENTS.JOIN_ROOM, async (payload) => {
            try {
                let activeRoom = await gameService.getActiveRoom(payload);
                if(activeRoom){
                    let playerData = {
                        userId: socket.id,
                        name: socket.user.name
                    }
                    socket.contestCode = activeRoom.contestCode;
                    socket.seatNumber = 1;
                    let players = activeRoom.players;
                    players.push(playerData);
                    let profileDataToSave = {
                        players: players,
                        nParticipants:2,
                    }
                    let updatedData = await gameService.updateGameProfile(activeRoom._id, profileDataToSave);
                    // save data into redis
                    await redis_service.setValue(socket.contestCode ,updatedData);

                    // now prepare gameData
                    let roomId = (updatedData._id).toString();
                    socket.roomId = roomId
                    socket.join(roomId);
                    let gameDataToSave = {
                        roomId:updatedData._id,
                        response: [],
                        userId: socket.id
                    }
                    let gameData = await gameService.createGameData(gameDataToSave);

                    // save data into redis
                    let key = activeRoom.contestCode+'_'+socket.id;
                    await redis_service.setValue(key,gameData);

                    io.to(socket.id).emit(SOCKET_EVENTS.JOIN_ROOM, { data: updatedData});
                    io.to(socket.roomId).emit(SOCKET_EVENTS.LOAD_GAME, { 'status': true });

                    let activeQuestions = await gameService.getQuestions({});
                    if(!activeQuestions.length){
                        const errorJson = { 'status':false, 'statusCode': 400, 'response': { 'headers': 'Game Error', 'description': 'please wait for couple of minutes.' } };
                        io.to(socket.id).emit(SOCKET_EVENTS.GAME_ERROR, { "data": errorJson});
                    }else{
                        await redis_service.setValue('questions', activeQuestions);
                        profileDataToSave.totalQuestions = activeQuestions.length;
                        await redis_service.setValue(socket.contestCode ,profileDataToSave);
                    }
                } else {
                    let playerData = {
                        userId: socket.id,
                        name: socket.user.name
                    }
                    let players = [];
                    let contestCode = (uniqid.time()).toUpperCase();
                    socket.contestCode = contestCode;
                    socket.seatNumber = 0;
                    players.push(playerData);
                    let profileDataToSave = {
                        players: players,
                        nParticipants:1,
                        host:socket.id,
                        entryFee:payload.entryFee,
                        winningAmount: 2*payload.entryFee,
                        contestCode: contestCode
                    }
                    let updatedData = await gameService.createGameProfile(profileDataToSave);
                    // save data into redis
                    await redis_service.setValue(socket.contestCode ,profileDataToSave);
                    // now prepare gameData
                    let roomId = (updatedData._id).toString();
                    socket.roomId = roomId
                    socket.join(roomId);
                    let gameDataToSave = {
                        roomId:updatedData._id,
                        response: [],
                        userId: socket.id
                    }
                    let gameData = await gameService.createGameData(gameDataToSave);

                    // save data into redis
                    let key = contestCode+'_'+socket.id;
                    await redis_service.setValue(key,gameData);

                    
                    io.to(socket.id).emit(SOCKET_EVENTS.JOIN_ROOM, { data: updatedData});
                }
            } catch (error) {
                const errorJson = { 'status':false, 'statusCode': 400, 'response': { 'headers': 'Game Error', 'description': 'please join game again.' } };
                console.log("error", error);
                io.to(socket.id).emit(SOCKET_EVENTS.GAME_ERROR, { "data": errorJson});
            }
        });

        socket.on(SOCKET_EVENTS.PLAY_NOW, async () => {
            let time = Math.floor(Math.random() * 3000); 
            setTimeout(async () => {
                let activeQuestions = await redis_service.getValue('questions');
                io.to(socket.id).emit(SOCKET_EVENTS.SEND_QUESTION, {question: activeQuestions[0], questionIndex:1});
            }, time);
        });

        socket.on(SOCKET_EVENTS.USER_CHOICE, async (payload) => {
            try {
                if(payload.userChoice){
                    let key = socket.contestCode+'_'+socket.id;
                    let gameData = await redis_service.getValue(key);
                    let gameProfileData = await redis_service.getValue(socket.contestCode);
                    let userAns = {
                        questionId: payload.questionId,
                        ans: payload.userChoice
                    }
                    let response = gameData.response;
                    response.push(userAns);
                    gameData.response = response;
                    await redis_service.setValue(key, gameData);
                    if(gameProfileData.totalQuestions==payload.questionIndex){
                        let activeQuestions = await redis_service.getValue('questions');
                        let correctAns = await gameService.calculateCorrectAns(gameProfileData, gameData, activeQuestions); 
                        gameData.isCompleted = true;
                        gameData.correctAns = correctAns;
                        gameData.isActive=false;
                        await redis_service.setValue(key, gameData);
                        let otherPersonId;
                        if((gameProfileData.players[0].userId).toString()==socket.id) otherPersonId = gameProfileData.players[1].userId;
                        else otherPersonId = gameProfileData.players[0].userId;
                        let otherkey = socket.contestCode+'_'+otherPersonId;
                        let otherPersonData = await redis_service.getValue(otherkey);

                        if(gameProfileData.nParticipants==2 && gameData.isCompleted && otherPersonData.isCompleted){
                            console.log("result updated")
                            if(gameData.correctAns>otherPersonData.correctAns){
                                gameProfileData.winner = gameProfileData.players[0].userId;
                                gameProfileData.resultDeclaredReson=1;
                            }else if(gameData.correctAns<otherPersonData.correctAns) {
                                gameProfileData.winner = gameProfileData.players[1].userId;
                                gameProfileData.resultDeclaredReson=1;
                            } else {
                                gameProfileData.resultDeclaredReson=2;
                            }
                            gameProfileData.gameEndTime = new Date();
                            gameProfileData.isActive = false;
                            await redis_service.setValue(socket.contestCode, gameProfileData);
                            io.to(socket.roomId).emit(SOCKET_EVENTS.GAME_OVER, { "response": gameProfileData});
                            // UPDATE MONGO
                            console.log("otherPersonid", otherPersonId);
                            console.log("socketid", socket.id)
                            await gameService.updateGameProfile(gameData.roomId, gameProfileData);
                            await gameService.updateGameData(gameData.roomId, gameData);
                            await gameService.updateGameData(otherPersonData.roomId, otherPersonData);
                        }
                    }else{
                        let activeQuestions = await redis_service.getValue('questions');
                        io.to(socket.id).emit(SOCKET_EVENTS.SEND_QUESTION, {question: activeQuestions[payload.questionIndex], questionIndex:payload.questionIndex+1});
                    }
                } else {
                    const errorJson = { 'status':false, 'statusCode': 400, 'response': { 'headers': 'Game Error', 'description': 'Wrong Choice, please select valid one.' } };
                    console.log("error", error)
                    io.to(socket.id).emit(SOCKET_EVENTS.GAME_ERROR, { "data": errorJson});
                }
            } catch (error) {
                
            }
        });

    });
};

module.exports = socketConnection;