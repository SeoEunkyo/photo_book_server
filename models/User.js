const mongoose = require('mongoose');

const Userchema = new mongoose.Schema({
    name : {type: String, required:true},
    username : {type: String, required:true, index: true, unique: true},
    hashedPassword : {type: String, required:true},
    session : [
        {
            createAt : {type:Date, required : true}
        },
    ],

},
{timestamps : true})

module.exports = mongoose.model('user',Userchema);