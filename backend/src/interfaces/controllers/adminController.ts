import { Request,Response } from "express";
import { loginAdmin } from "../../application/usecases/loginAdmin";


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
    }
}
