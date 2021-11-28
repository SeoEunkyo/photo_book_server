const aws = require("aws-sdk");
const {AWS_ACCESS_KEY, AWS_SECRET_KEY} = process.env;

const s3 = new aws.S3({
    secretAccessKey:AWS_ACCESS_KEY,
    accessKeyId : AWS_ACCESS_KEY,
    region:'ap-northeast-2'
});

const getSignedUrl = ({key}) =>{

    return new Promise((resolve, reject)=>{
        s3.createPresignedPost({
            Bucket : "image-upload-tutorial2",
            Fields:{
                key,
            },
            Expires:300,
            Conditions:[
                ["content-length-range",0,50*100*1000],
                ["start-with","$Content-Type","image/"]
            ]
        },(err,data)=>{
            if(err) reject(err)
            resolve(data)
        })
    })
 
}

module.exports = {s3,getSignedUrl}