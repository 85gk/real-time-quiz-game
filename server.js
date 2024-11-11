require("dotenv").config()
const express = require('express')
const process = require('process');
const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const compression = require('compression');
app.use(compression())
const server = require('http').Server(app);
global.io = require('socket.io')(server);
const port = process.env.APP_PORT || 5010;

/********************************
***** Server Configuration *****
********************************/

/** Server is running here */
let startNodeserver = async () => {
    // initialize mongodb 
    require('./app/startup/db_mongo')();

    //initialise redis
    await require('./app/startup/db_redis');

    //initialise socket
    require(`./app/startup/socket`).connect(global.io);

    // express startup.
    await require('./app/startup/expressStartup')(app);

    return new Promise((resolve, reject) => {
            server.listen(port, (err) => {
                if (err) reject(err);
                resolve();
            });
    })
};


startNodeserver().then(() => {
    console.log('Server running on', port);
}).catch((err) => {
    console.log('Error in starting server', err);
    process.exit(1);
});

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error);
});

module.exports = server;
