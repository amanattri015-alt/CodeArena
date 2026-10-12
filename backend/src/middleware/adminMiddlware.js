const jwt=require("jsonwebtoken");
const redisClient = require("../config/redis");
const User = require("../model/user");

const adminMiddleware=async (req,res,next)=>{
    try{
    const {token}=req.cookies;
        if(!token) {
            res.send("Token doesn't exists");
        }
        const payload = jwt.verify(token,process.env.JWT_KEY);
        if (!payload || !payload.exp) {
                return res.status(400).send("Invalid token");
        }
        const {_id}=payload;
        if(payload.role!='admin') {
              return res.status(400).send("Invalid token");
        }
        const result=await User.findById(_id);
        if(!result) {
         
            return res.status(400).send("User does not exists");
        }

        const isBlocked=await redisClient.exists(`token:${token}`);
        if (isBlocked) {
            return res.status(401).send("Token is blocked");
        }
        req.result=result;
        next();
    }
    catch (err) {
        return res.status(401).send("Invalid or expired token");
    }
};

module.exports = adminMiddleware;


    
