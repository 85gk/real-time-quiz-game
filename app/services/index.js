
/********************************
 **** Managing all the services ***
 ********* independently ********
 ********************************/
 module.exports = {
    authService: require('./authService'),
    userService: require('./userService'),
    gameService: require('./gameService')
};