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

    app.post('/upload', upload.single("image"), async (req, res) => {
        // console.log(req.file);
        await new Image({key : req.file.fieldname, originalFileName : req.file.originalname }).save();
        res.json({ result: "success" });
    })
    app.listen(port, () => console.log("Express server listening on PORT " + port));
    console.log('mongodb conected!!')

}).catch((err) => console.log(err))

