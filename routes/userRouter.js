const {Router} = require("express");
const userRouter = Router();
const User = require('../models/User')
const {hash ,compare} = require("bcryptjs")

userRouter.post('/resister', async(req,res)=>{

    try {
        if(req.body.password.length < 6 ) throw new Error("password 길이는 6글자 이상!");
        if(req.body.username.length < 3 ) throw new Error("username 길이는 3글자 이상!");
        const hashedPassword = await hash(req.body.password,10);
        const newUser = await new User({
            user : req.body.user,
            username : req.body.username,
            hashedPassword
        }).save();
        // console.log(req.body);
        res.json(newUser);    
        
    } catch (error) {
        res.status(400).json({message : error.message})
    }


})

userRouter.post('/login', async (req,res)=>{


    try{
        const user = await User.findOne({username : req.body.username});
        // console.log(user);
        const isValid = await compare(req.body.password, user.hashedPassword);
        if(!isValid) throw new Error("입력하신 정보가 올바르지 않습니다");

        res.json('성공적인 로그인을 하였습니다.')
    }catch(error){
        res.status(400).json({message : error.message})
    }


})


module.exports = {userRouter};