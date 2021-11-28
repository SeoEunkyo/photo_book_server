const {Router} = require("express");
const { v4: uuid } = require('uuid')
const mime = require('mime-types');

const imageRouter = Router();
const Image = require('../models/Images');
const {upload} = require('../middleware/imageUpload');
const fs = require('fs');
const {promisify} = require('util');
const mongoose = require('mongoose');
const {s3, getSignedUrl} = require('../aws')

// const fileUnlink = promisify(fs.unlink);

imageRouter.post("/presigned", async(req,res)=>{
    try{
        if(!req.user) throw new Error("권하니 없습니다.");
        const {contentTypes} = req.body;
        if(!Array.isArray(contentTypes)) throw new Error("정상적인 파일이 아닙니다");

        const presignedData = await Promise.all(  contentTypes.map(async (contentType)=>{
            const imageKey = `${uuid()}.${mime.extension(contentType)}`;
            const key =`raw/${imageKey}`;
            const presigned = await getSignedUrl({key});
            return {imageKey, presigned}
        }))


        res.json(presignedData);

    }catch(err){

    }

})

imageRouter.post('/', upload.array("image", 5), async (req, res) => {
    // 유저 정보 확인 , public 유뮤확인

    try {
        if (!req.user) throw new Error("사용자 권한이 없습니다");
        const { images, public } = req.body;

        const imageDocs = await Promise.all(images.map((image) => new Image({
            user: {
                _id: req.user.id,
                name: req.user.name,
                username: req.user.username,
            },
            public,
            key: image.imagekey,
            originalFileName: image.originalname
        }).save()
        ))

        res.json(imageDocs);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }

})

// imageRouter.post('/', upload.array("image",5), async (req, res) => {
//     // 유저 정보 확인 , public 유뮤확인

//     try {
//         if(!req.user) throw new Error("사용자 권한이 없습니다");
//         const images = await Promise.all(
//             req.files.map(async file => {
//                 const image = await new Image({
//                     user: {
//                         _id: req .user.id,
//                         name: req.user.name,
//                         username: req.user.username,
//                     },
//                     public: req.body.public,
//                     key: file.key,
//                     originalFileName: file.originalname
//                 }).save();

//                 return image
//             })
//         ) 
        
//         res.json(images);
//     } catch (error) {
//         console.error(error);
//         res.status(400).json({ message: error.message });
//     }

// })
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
        // await fileUnlink(`./uploads/${imagefile.key}`);
        s3.deleteObject({Bucket:'image-upload-tutorial2', key:`raw/${image.key}`}, (err,data)=> {
            if(error) throw error;
        })
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