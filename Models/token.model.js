const mongoose = require("mongoose");

const tokenSchema = mongoose.Schema({
	email:{
        type:String,
        required:true,
        unique:true
    },
    token:{
        type:String,
        required:true
    }
},{collection:"tokens"});

module.exports =  mongoose.model("Token", tokenSchema);