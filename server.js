const express = require('express');
const multer = require('multer');
const { v4: uuid } = require('uuid')
const mime = require('mime-types');
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "./uploads"),
    filename: (req, file, cb) => cb(null, `${uuid()}.${mime.extension(file.mimetype)}`)
})

const mongoose = require('mongoose');
const mongoosinfo = require('./private/dbinfo');

const upload = multer({
    storage, limits: { fileSize: 1024 * 1024 * 5 }, fileFilter: (req, file, cb) => {
        if (["image/jpg", "image/png", "image/jpeg"].includes(file.mimetype)) cb(null, true);
        else cb(new Error("invalid file type"), file)
    }
})

const app = express();
const port = 5000;



mongoose.connect(mongoosinfo
).then(() => {

    app.post('/upload', upload.single("image"), (req, res) => {
        console.log(req.file);
        res.json({ result: "success" });
    })
    app.listen(port, () => console.log("Express server listening on PORT " + port));
    console.log('mongodb conected!!')

}).catch((err) => console.log(err))

