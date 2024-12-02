import { Request,Response } from "express";
import { listTurf } from "../../application/usecases/listTurf";
import { loginTurf } from "../../application/usecases/loginTurf";
import { TurfRepositoryImpl } from "../../infrastructure/database/repositories/TurfRepositoryImpl";
import { generateOtp } from "../../application/usecases/generateOtp";
import { validateOtp } from "../../application/usecases/validateOtp";
import { updateTurfDetails } from "../../application/usecases/updateTurfDetails";
import { uploadedImage } from "../../application/usecases/UploadImage";
import { updateSlot } from "../../application/usecases/updateSlot";
import { getTurfDetailsFromMail } from "../../application/usecases/getTurfId";
import { getSlots } from "../../application/usecases/getSlots";

interface CustomRequest extends Request {
    files?: Express.Multer.File[];
  }

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
    updateTurfDetails: async (req: Request, res: Response) => {
        try {
            const customReq = req as CustomRequest;
            if (!customReq.files) throw new Error("No files uploaded");
            const uploadedImages = await uploadedImage(customReq.files);
            const { email, ...data } = customReq.body;
            const updatedData={data,...{gallery:uploadedImages}}
            const updatedTurf = await updateTurfDetails(TurfRepositoryImpl, email, updatedData);
      
            res.status(200).json(updatedTurf);
          } catch (error: any) {
            res.status(400).json({ message: error.message });
          }
      },
      slotUpdate:async (req: Request, res: Response) => {
        try {
            console.log(req.body)
            const {email,interval,noOfSlots,...slot}=req.body
            const turfDetails=await getTurfDetailsFromMail(email)
            const id=turfDetails?._id as string
            console.log(id)
            const updatedTurf = await updateSlot(TurfRepositoryImpl, id,slot,interval,noOfSlots);
            res.status(200).json({ message: 'Slot updated successfully.'});
          } catch (error: any) {
            res.status(400).json({ message: error.message }); 
          }
      },
      getSlots:async (req: Request, res: Response) => {
        try {
            const email=req.params.email
            const turfDetails=await getTurfDetailsFromMail(email)
            const id=turfDetails?._id as string
            console.log(id)
            const slots = await getSlots(TurfRepositoryImpl,id);
            res.status(200).json({slots});
          } catch (error: any) {
            res.status(400).json({ message: error.message }); 
          }
      }
}
 