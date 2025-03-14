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
        secure:true,
        maxAge:24*60*60*1000
    }

    res.cookie("token",token,cookieOptions)

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

export {registerUser, veryfyUser, loginUser}