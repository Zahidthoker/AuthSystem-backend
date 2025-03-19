import User from "../models/user.model.js"
import crypto from "crypto";
import sendmail from "../utils/sendmail.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";


const registerUser= async (req, res) =>{
    //create a new user
    const {name, email, password} = req.body
    if(!name||!email  ||!password){
        return res.status(400).json({
            success: false,
            message:"All fields are required"
        })
    }

    try {
        const existingUser =await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success: false,
                message:"email is already registered",
                name:existingUser.name
            })
        }
        
        // create user 

        const user = User.create({
            name,
            email,
            password,
        })
        if(!user){
            return res.status(404).json({
                success: false,
                message:"user not registered",
                
            })
        }

        //create token and save in db

        const token = crypto.randomBytes(32).toString('hex');
        (await user).verificationToken = token;
        (await user).save();


        //send token to the user
        sendmail(email,token);

        res.status(200).json({
            success:true,
            message:"user registered successfully"
        })
        
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:"failed to register user"
        })
    }

};

const veryfyUser = async(req, res) =>{
    const token = req.params.token;
    const user = await User.findOne({verificationToken:token});
    if(!user){
        return res.status(400).json({
            success:false,
            message:"Invalid token" 
        })
    }

    (await user).isVarified = true;
    (await user).verificationToken = undefined;

    (await user).save();

    res.status(200).json({
        success:true,
        message:"user verified successfully",
        name: user
    })
};

const loginUser = async(req,res) =>{
   const {email, password} = req.body;
   if(!email || !password){
    return res.status(400).json({
        success:false,
        message:"Email and password are required",
    })
   }
   
   try {

    const user =await User.findOne({email})
    if(!user){
        return res.status(400).json({
            success:false,
            message:"Email and password are required",
        })
    }

    const isMatch =await bcrypt.compare(password, user.password);
    
    if(!isMatch){
        return res.status(400).json({
            success:false,
            message:"Email or password does not match",
        })
    }
    
    if(user.isVarified===false){
        return res.status(400).json({
            success:false,
            message:"Email is not varified, pleae varify the email first"
        })
    }

    // create a jwt token for the user session
    const token = jwt.sign({id:user._id, role:user.role},'shhhh',{expiresIn:'24h'});

    
    //Now store this token in the cookie of the user
    const cookieOptions = {
        httpOnly:true,
        secure:false,
        maxAge:24*60*60*1000
    }
    res.cookie("token",token,cookieOptions);
    res.status(200).json({
        success:true,
        message:"login successful",
        token,
        name:{
            id:user._id,
            name:user.name,
            role:user.role
        }
    })
    
    
   } catch (error) {
    return res.status(400).json({
        success:false,
        message:`something went wrong: error: ${error}`,
    })
   }


}

const getUser = async(req, res)=>{ 
    const id = req.user.id;
    const user = await User.findById(id).select("-password");
    if(!user){
        return res.status(404).json({
            success:false,
            message:"User not found"
        })
    }
    res.status(200).json({
        success:true,
        message:"User profile found",
        user:user,
    })
}
const logOut = async(req, res, next)=>{
    const id = req.user.id;
    const user = await User.findById(id);
    user.token = null;
    res.cookie('token','');
    res.status(200).json({
        success:true,
        message:"Logged out successfully"
    })

}
const forgetPassword = async(req, res)=>{
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user){
        return res.status(404).json({
            success:false,
            message:"Invalid email address"
        })
        
    }

    try {
        const token = jwt.sign({id:user._id, role:user.role},process.env.SECRET,{expiresIn:'24h'});
        user.resetPasswordToken = token;
        user.resetPasswordExpiry =  Date.now() + 10*60*1000;
        await user.save(); 
        sendmail(email,token);
        res.status(200).json({
            success:true,
            message:"reset password mail has been sent to your email id"
        })
    } catch (error) {
        return res.status(404).json({
            success:false,
            message:`Error: ${error}`
        })
    }
}
const resetPasswor = async(req, res)=>{
    const {token} = req.params;
    const {newPassword} = req.body;
    const user = await User.findOne({
        resetPasswordToken:token,
        resetPasswordExpiry:{$gt:Date.now()}
    });

    if(!user){
        return res.status(400).json({
            success:false,
            message:"cannot reset password, please try again"
        })
    }

    user.password = newPassword;
    user.resetPasswordToken=null;
    user.resetPasswordExpiry=null;
    await user.save();
    res.status(200).json({
        success:true,
        message:"Password changed successfully"
    })


}
export {registerUser, veryfyUser, loginUser, getUser, logOut, forgetPassword, resetPasswor}