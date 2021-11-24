const {Router} = require("express");
const userRouter = Router();
const User = require('../models/User')
const {hash ,compare} = require("bcryptjs")
const Images = require("../models/Images")

userRouter.post('/register', async(req,res)=>{

    try {
        if (req.body.password.length < 6) throw new Error("password 길이는 6글자 이상!");
        if (req.body.username.length < 3) throw new Error("username 길이는 3글자 이상!");
        const hashedPassword = await hash(req.body.password, 10);
        const newUser = await new User({
            name: req.body.name,
            username: req.body.username,
            hashedPassword,
            session : [{createAt : new Date()}]
        }).save();
        // console.log(req.body);

        const session = newUser.session[0];
        res.json({
            message: '성공적인 가입이 되었습니다.',
            sessionId: session._id,
            name: newUser.name,
            id : newUser._id
        })

    } catch (error) {
        res.status(400).json({ message: error.message })
    }


})

userRouter.patch('/login', async (req,res)=>{


    try{
        const user = await User.findOne({username : req.body.username});
        if(!user) throw new Error("email을 알수 없습니다.");
        // console.log(user);
        const isValid = await compare(req.body.password, user.hashedPassword);
        if(!isValid) throw new Error("입력하신 정보가 올바르지 않습니다");
        user.session.push({createAt : new Date()});
        const session = user.session[user.session.length - 1];
        await user.save();
        res.json({
            message: '성공적인 로그인을 하였습니다.',
            sessionId: session._id,
            name: user.name,
            id : user._id
        })


    }catch(error){
        res.status(400).json({message : error.message})
    }


})


userRouter.patch("/logout", async(req,res)=>{
    try {
        console.log(req.headers);

        const {sessionid} = req.headers;
        if(!req.user) throw new Error('invalid session id');
        const result = await User.updateOne({_id : req.user._id},{
            $pull : {session: {_id:sessionid}}
        })
        res.json({message : "user is logged out."});

    } catch (error) {
        console.log(error);
        res.status(400).json({message : error.message});
    }

})


userRouter.get("/me" , (req,res) =>{

    try {
     
        if(!req.user) throw new Error("사용자 권한이 없습니다.") ;
        res.json({
            message: '성공적인 로그인을 하였습니다.',
            sessionId: req.headers.sessionid,
            name: req.user.name,
            id:req.user._id
        })
        
    } catch (error) {
        console.log(error);
        res.status(400).json({message : error.message});
    }
})

userRouter.get("/me/images", async (req,res)=>{

    try {
        console.log("req.user : ", req.user);
        if(!req.user) throw new Error("사용자권한을 확인하세요");
        const images = await Images.find({ "user._id": req.user.id });
        res.json(images);

    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }


})

module.exports = {userRouter};