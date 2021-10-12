const mongoose =require("mongoose");
const  User = require("../models/User");

const autuenticate = async (req, res, next) =>{
    const {sessionid } = req.headers;
    if(!mongoose.isValidObjectId(sessionid) || !sessionid) return next();
    const user = await User.findOne({"session._id" : sessionid});
    if(!user) return next();

    req.user = user;
    return next();


}

module.exports = {autuenticate};