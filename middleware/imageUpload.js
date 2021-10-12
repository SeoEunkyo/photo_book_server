const multer = require('multer');
const { v4: uuid } = require('uuid')
const mime = require('mime-types');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "./uploads"),
    filename: (req, file, cb) => cb(null, `${uuid()}.${mime.extension(file.mimetype)}`)
})


const upload = multer({
    storage,
     limits: { fileSize: 1024 * 1024 * 5 },
      fileFilter: (req, file, cb) => {
        if (["image/jpg", "image/png", "image/jpeg"].includes(file.mimetype)) cb(null, true);
        else cb(new Error("invalid file type"), file)
    }
})


module.exports = {upload};