import { Request,Response } from "express";
import { loginAdmin } from "../../application/usecases/loginAdmin";
import { UserModel } from "../../infrastructure/database/models/userModel";
import { getUsers } from "../../application/usecases/admin/getUsers";
import { AdminRepositoryImpl } from "../../infrastructure/database/repositories/AdminRepositoryImpl";
import { getTurfs } from "../../application/usecases/admin/getTurfs";
import { getBookings } from "../../application/usecases/admin/getBookings";
import { blockUser } from "../../application/usecases/admin/blockUser";


export const adminController={
    login:async(req:Request,res:Response)=>{ 
        try {
            const {email,password}=req.body
            const token=await loginAdmin(email,password)
            res.cookie("auth_token", token, {httpOnly: true,maxAge: 86400000});
            res.status(200).json({message:"you can login now",token})
        } catch (error:any) {
            res.status(400).json({message:error.message})
        }
    },
    getUser:async(req:Request,res:Response)=>{ 
        try {
            const users = await getUsers(AdminRepositoryImpl)
            console.log(users);
            res.status(200).json({users})
        } catch (error:any) {
            res.status(400).json({message:error.message})
        }
    },
    getTurf:async(req:Request,res:Response)=>{ 
        try {
            const turfs = await getTurfs(AdminRepositoryImpl)
            console.log(turfs);
            res.status(200).json({turfs})
        } catch (error:any) {
            res.status(400).json({message:error.message})
        }
    },
    getBookings:async(req:Request,res:Response)=>{ 
        try {
            const bookings = await getBookings(AdminRepositoryImpl)
            res.status(200).json({bookings})
        } catch (error:any) {
            res.status(400).json({message:error.message})
        }
    },
    blockUser:async(req:Request,res:Response)=>{ 
        try {
            const {id,block}=req.params
            console.log(req.params)
            await blockUser(AdminRepositoryImpl,id,parseInt(block))
            res.status(200)
        } catch (error:any) {
            res.status(400).json({message:error.message})
        }
    }
}
