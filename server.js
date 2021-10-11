require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { v4: uuid } = require('uuid')
const mime = require('mime-types');
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "./uploads"),
    filename: (req, file, cb) => cb(null, `${uuid()}.${mime.extension(file.mimetype)}`)
})
const Image = require('./models/images')
const mongoose = require('mongoose');

const upload = multer({
    storage, limits: { fileSize: 1024 * 1024 * 5 }, fileFilter: (req, file, cb) => {
        if (["image/jpg", "image/png", "image/jpeg"].includes(file.mimetype)) cb(null, true);
        else cb(new Error("invalid file type"), file)
    }
})

const app = express();
const port = 5000;



mongoose.connect(process.env.Mongo_URI
).then(() => {
    app.use('/uploads', express.static('uploads'));

    app.post('/images', upload.single("image"), async (req, res) => {
        // console.log(req.file);
        const images = await new Image({key : req.file.filename, originalFileName : req.file.originalname }).save();
        res.json(images);
    })
    app.get('/images', async (req, res) =>{
        const images = await Image.find();
        res.json(images)
    })
    app.listen(port, () => console.log("Express server listening on PORT " + port));
    console.log('mongodb conected!!')

}).catch((err) => console.log(err))

