
const aaa = (req,res,next) => {
    console.log('middleware')
    return next();
} 

module.exports = {aaa};