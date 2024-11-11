const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongo = require("../startup/db_mongo")

const quesiionSchema = new Schema({
    question:{ type:String },
    choices:[{ type:String }],
    ans :{ type: Number },
    isActive:{ type:Boolean, default: true }
},{ timestamps:true })

module.exports = mongoose.model('question', quesiionSchema);    