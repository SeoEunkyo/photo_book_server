const mongoose =require("mongoose");
const  User = require("../models/User");

const autuenticate = async (req, res, next) =>{
    const {sessionid } = req.headers;
    console.log('middle sessionid :' , sessionid);
    if(!mongoose.isValidObjectId(sessionid) || !sessionid) return next();
    const user = await User.findOne({"session._id" : sessionid});
    console.log("user : ", user);
    if(!user) return next();

    req.user = user;
    return next();
}

module.exports = {autuenticate};
