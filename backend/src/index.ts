import express,{Request,Response} from "express"
import cors from "cors"
import "dotenv/config"
import userRoutes from "./infrastructure/routes/userRoutes"
import turfRoutes from "./infrastructure/routes/turfRoutes"
import adminRoutes from "./infrastructure/routes/adminRoutes"
import path from "path"


 



import { connectDB } from "./infrastructure/database/connect"
import { sendOtpEmail } from "./infrastructure/services/emailService"


const app=express()

app.use(express.json()) 
app.use(express.urlencoded({extended:true}))
app.use(cors())
const paths=path.join(__dirname,"public")
app.use(express.static("public"));
console.log(paths)
 
connectDB()
 

app.use("/api/users", userRoutes);
app.use("/api/turfs",turfRoutes)
app.use("/api/admin",adminRoutes)


app.listen(7000,()=>{
    console.log("running at 7000")
})
