import express,{Request,Response} from "express"
import cors from "cors"
import "dotenv/config"
import userRoutes from "./infrastructure/routes/userRoutes"
import turfRoutes from "./infrastructure/routes/turfRoutes"
import adminRoutes from "./infrastructure/routes/adminRoutes"

import { connectDB } from "./infrastructure/database/connect"
import { sendOtpEmail } from "./infrastructure/services/emailService"

// const client=new MongoClient(process.env.MONGODB_CONNECTION_STRING as string)
// mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string).then(()=>{
//     console.log("mongodb connected")
// })

const app=express()

app.use(express.json()) 
app.use(express.urlencoded({extended:true}))
app.use(cors())
 
connectDB()
 
// app.use("/api/auth",authRoutes)
// app.use("/api/users",userRoutes)

app.use("/api/users",userRoutes)
app.use("/api/turfs",turfRoutes)
app.use("/api/admin",adminRoutes)


app.listen(7000,()=>{
    console.log("running at 7000")
})
