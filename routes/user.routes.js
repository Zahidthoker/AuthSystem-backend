import express from "express";
import { registerUser, veryfyUser, loginUser, getUser, logOut, forgetPassword, resetPasswor} from "../controllers/user.controller.js";
import {isLoggedIn }from "../middleware/auth.middleware.js"

const router = express.Router(); 

router.post('/register',registerUser)
router.get('/veryfy/:token',veryfyUser)
router.post('/login', loginUser);
router.get('/me',isLoggedIn,getUser)
router.post('/logout',isLoggedIn,logOut)

export default router;