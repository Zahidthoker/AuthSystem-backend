import mongoose from "mongoose";

const db_con = ()=>{
    mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log("connection established")
})
.catch((err)=>{
    console.log("error establishing connection",err)
})
}

export default(db_con) ;