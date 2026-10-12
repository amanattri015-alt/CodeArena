const express=require("express");
const authRouter=express.Router();
const userMiddleware=require("../middleware/userMiddleware");
const adminMiddleware=require("../middleware/adminMiddlware");
const {register,login,logout,adminRegister,deleteProfile}=require("../controller/userAuthet");

//register for user
authRouter.post("/register",register);

//login for user
authRouter.post("/login",login);

//logout for user
authRouter.post("/logout",userMiddleware,logout);

authRouter.post("/admin/register",adminMiddleware,adminRegister);

authRouter.delete("/deleteProfile",userMiddleware,deleteProfile);
authRouter.get("/check",userMiddleware,(req,res)=>{
       try {
        const user = {
            _id: req.result._id,
            firstName: req.result.firstName,
            emailId: req.result.emailId,
            role: req.result.role,
            problemSolved: req.result.problemSolved || []
        };

        res.status(200).json({
            user,
            message: "valid user"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
module.exports=authRouter;