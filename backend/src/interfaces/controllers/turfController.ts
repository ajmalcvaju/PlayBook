import { Request,Response } from "express";
import { listTurf } from "../../application/usecases/listTurf";
import { loginTurf } from "../../application/usecases/loginTurf";
import { TurfModel } from "../../infrastructure/database/models/turfModel";
import { TurfRepositoryImpl } from "../../infrastructure/database/repositories/TurfRepositoryImpl";
import { generateOtp } from "../../application/usecases/generateOtp";
import { validateOtp } from "../../application/usecases/validateOtp";
import { updateTurfDetails } from "../../application/usecases/updateTurfDetails";


export const turfController={
    list:async(req:Request,res:Response)=>{
        try {
            const turf= await listTurf(TurfRepositoryImpl,req.body);
            console.log(turf.email)
            await generateOtp(turf.email,0);
            res.status(200).json({ message: 'Turf registered. OTP sent to your email.' });
        } catch (error:any) {
            res.status(400).json({message:error.message})
        }
    },
    validateOtp:async(req:Request,res:Response)=>{ 
        try {
            const { email, otp } = req.body;
            const token=await validateOtp(email, otp,0);
            res.cookie("auth_token", token, {httpOnly: true,maxAge: 86400000});
            res.status(200).json({ message: 'OTP verified successfully. You can now log in.',token});
        } catch (error:any) {
            res.status(400).json({message:error.message})
        }
    },
    login:async(req:Request,res:Response)=>{ 
        try {
            const token=await loginTurf(TurfRepositoryImpl,req.body.email,req.body.password)
            res.cookie("auth_token", token, {httpOnly: true,maxAge: 86400000});
            res.status(200).json({ message: 'You can now log in.',token});
        } catch (error:any) {
            res.status(400).json({message:error.message})
        }
    },
    updateTurfDetails:async(req:Request,res:Response)=>{ 
        try {
            let {email,...data}=req.body
            const updatedTurf = await updateTurfDetails(TurfRepositoryImpl,email,data);
            res.status(200).json(updatedTurf);
        } catch (error:any) {
            res.status(400).json({message:error.message})
        }
    }
}
