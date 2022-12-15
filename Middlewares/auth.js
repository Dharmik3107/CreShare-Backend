const jwt = require('jsonwebtoken')

const authenticate = async(req,res,next)=>{
    const header = req.header["authorization"];
    const token = header.split(" ")[1];
    if(token === null){
        return res.status(401).json({
            error:true,
            message:"Unauthorized User"
        })
    }
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(error,user)=>{
        if(error) return res.status(500).json({
            error:true,
            message:"Invalid Token"
        })
        req.user = user;
        next();
    })
}

module.exports =  { authenticate};