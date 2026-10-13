const User=require("../model/user");
const validate=require("../utils/validate");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const redisClient=require("../config/redis");
const Submission=require("../model/submission");

const register=async (req,res)=>{

    try{
    //validator to check data is send by user is correct
    validate(req.body);

    const {firstName,emailId,password}=req.body;
    req.body.password=await bcrypt.hash(password,10);
    req.body.role='user';
    const user=await User.create(req.body);
    const token=jwt.sign({_id:user._id,emailId:emailId,role:'user'},process.env.JWT_KEY,{expiresIn:60*60});
     const reply={
            firstName:user.firstName,
            emailId:user.emailId,
            _id:user._id
        }
    res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 60 * 1000,
    path: "/"
});
    res.status(201).json({
            user:reply,
            message:"login successfully"
        })

    }

    catch(err) {
        res.status(400).send("Error :"+err.message);
    }

}

const login=async (req,res)=>{
    try {
        const {emailId,password}=req.body;
        if(!emailId) {
            throw new Error("Invalid credentials");
        }

        if(!password) {
            throw new Error("Invalid credentials");
        }
        const user=await User.findOne({emailId});
        if (!user) {
            throw new Error("Invalid credentials");
        }
        const match=await bcrypt.compare(password,user.password);
        if(!match) {
            throw new Error("Invalid Credentials");
        }

        const reply={
            firstName:user.firstName,
            emailId:user.emailId,
            _id:user._id
        }

        const token=jwt.sign({_id:user._id,emailId:emailId,role:user.role},process.env.JWT_KEY,{expiresIn:60*60});
        res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 60 * 60 * 1000,
        path: "/"
});

        res.status(200).json({
            user:reply,
            message:"login successfully"
        });
    }

    catch(err) {
        res.status(401).send("Error :"+ err.message);
    }
}

const logout=async(req,res)=>{
    try {
    const {token}=req.cookies;
   
    const payload = jwt.decode(token);

    // Calculate remaining JWT lifetime in seconds
    const remainingTime = payload.exp - Math.floor(Date.now() / 1000);
   if (remainingTime > 0) {
            await redisClient.set(
                `token:${token}`,
                "invalid",
                {
                    EX: remainingTime
                } 
            );
        }

        res.clearCookie("token");

        return res.status(200).send("Logout successfully");

    }

    catch(err) {
        return res.status(400).send("Error: " + err.message);
    }
}

const adminRegister=async (req,res)=>{
    try{
    //validator to check data is send by user is correct
    validate(req.body);

    const {firstName,emailId,password}=req.body;
    req.body.password=await bcrypt.hash(password,10);

    req.body.role="admin";
    const user=await User.create(req.body);
    const token=jwt.sign({_id:user._id,emailId:emailId,role:"admin"},process.env.JWT_KEY,{expiresIn:60*60});
    res.cookie("token",token,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",maxAge:60*60*1000});
    res.status(201).send("user registered successfully");

    }

    catch(err) {
        res.status(400).send("Error :"+err.message);
    }

}

const deleteProfile=async (req,res)=>{
    try {
         const userId=req.result._id;
         await User.findByIdAndDelete(userId);

         await Submission.deleteMany({userId});
         res.status(200).send("User profile deleted successfully");
    }

    catch(err) {
        
        res.status(400).send("Error :"+err.message);
    

    }
}

module.exports={register,login,logout,adminRegister,deleteProfile};