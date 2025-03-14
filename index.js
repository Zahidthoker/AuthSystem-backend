import express from "express";
import dotenv from "dotenv"
import db_connection from "./utils/uer.db.js"
import userRoutes from "./routes/user.routes.js"
import cookie from "cookie-parser"

dotenv.config();

const port = process.env.PORT || 4000;

const app = express();
db_connection();
app.use(express.json());
// app.use(cors({
//     origin:process.env.BASE_URL,
//     Credential:true,
//     methods:["GET","POST","DELETE","OPTIONS"],
//     allowedHeaders:["content-Type","Authorization"],
// }))

app.use('/api/v1/users',userRoutes) 
app.use(cookie) 


app.listen(port,()=>{
    console.log(`APP is listening on port ${port}`);
})