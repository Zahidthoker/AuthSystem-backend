import express from "express";
import { registerUser, veryfyUser, loginUser} from "../controllers/user.controller.js";
const router = express.Router(); 

router.post('/register',registerUser)
router.get('/veryfy/:token',veryfyUser)
router.post('/login', loginUser);


export default router;