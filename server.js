require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const {imageRouter} = require('./routes/imageRouter');
const {userRouter} = require('./routes/userRouter');
const {autuenticate} = require('./middleware/authentication');


const app = express();
const {Mongo_URI , PORT} = process.env;


mongoose.connect(Mongo_URI
).then(() => {
    app.use('/uploads', express.static('uploads'));
    app.use(express.json())
    app.use( autuenticate) ;
    app.use('/images', imageRouter);
    app.use('/user', userRouter);

    app.listen(parseInt(PORT) , () => console.log("Express server listening on PORT " + PORT));
    console.log('mongodb conected!!')

}).catch((err) => console.log(err))

