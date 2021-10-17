const {Router} = require("express");
const imageRouter = Router();
const Image = require('../models/Images');
const {upload} = require('../middleware/imageUpload');
const fs = require('fs');
const {promisify} = require('util');
const mongoose = require('mongoose');

const fileUnlink = promisify(fs.unlink);

imageRouter.post('/', upload.single("image"), async (req, res) => {
    // 유저 정보 확인 , public 유뮤확인

    try {
        if(!req.user) throw new Error("사용자 권한이 없습니다");
        const images = await new Image({
            user : {
                _id : req.user.id,
                name : req.user.name,
                username : req.user.username,
            },
            public : req.body.public,
            key: req.file.filename,
            originalFileName:req.file.originalname
        }).save();
        res.json(images);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }

})
imageRouter.get('/', async (req, res) => {
    // public 이미지 제공
    const images = await Image.find();
    res.json(images)
})
imageRouter.delete('/:imageId' , async (req, res) =>{
    // 사용자권한 확인

    try {
        if(!req.user) throw new Error("사용자 권한이 없습니다");
        if(!mongoose.isValidObjectId(req.params.imageId)) throw new Error("올바르지 않은 이미지 정보입니다.");

        const imagefile = await Image.findOneAndDelete({_id: req.params.imageId});
        if(!imagefile) return res.json({message : "요청하신 이미지는 이미 삭제가 되었습니다."});
        await fileUnlink(`./uploads/${imagefile.key}`);
        res.json({message : "삭제를 완료하였습니다", imagefile});

    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }

})
imageRouter.get('/:imageId/like', async(req, res) => {
    // 유저권한 확인, like는 중복 방지
    try {
        if(!req.user) throw new Error("사용자 권한이 없습니다");
        if(!mongoose.isValidObjectId(req.params.imageId)) throw new Error("올바르지 않은 이미지 정보입니다.");

        const result = await Image.findByIdAndUpdate({_id: req.params.imageId},{$addToSet:{like : req.user.id} },{new:true});
        res.json(result);        
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }


})

imageRouter.get('/:imageId/unlike', async(req, res) => {
    // 유저권한 확인, like는 중복 방지
    try {
        if(!req.user) throw new Error("사용자 권한이 없습니다");
        if(!mongoose.isValidObjectId(req.params.imageId)) throw new Error("올바르지 않은 이미지 정보입니다.");

        const result = await Image.findByIdAndUpdate({_id: req.params.imageId},{$pull:{like : req.user.id} },{new:true});
        res.json(result);        
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
})

module.exports = {imageRouter};


// {_id : ObjectId("616b990a88897511f5191b9e")}