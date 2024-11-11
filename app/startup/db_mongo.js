const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
let uri = process.env.MONGO_URI

module.exports = async () => {
    try{
        const options = {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        };
        mongoose.connect(uri, options);
        console.log(`MongoDB connected at ${uri}` );
    } catch(error){
        console.log("mongodb connection error", error);
    }
};