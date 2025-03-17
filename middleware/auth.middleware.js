import jwt from "jsonwebtoken";
const isValid = async(req, res, next)=>{
    const token = req.cookies.token;
    if(!token){
        return res.status(400).json({
            success:false,
            message:"Invalid token"
        })
    }

    try {
        const decoded = jwt.verify(token, 'shhhh');
        req.user = decoded;
        console.log(decoded)
       next() 
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:`Server error: ${error}`
        })
    }


}

export {isValid}