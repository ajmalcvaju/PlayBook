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
import { currentSlots } from "../../application/usecases/turf/currentSots";
import { deleteSlot } from "../../application/usecases/turf/deleteSlot";
import { Console } from "console";
import { getBookings } from "../../application/usecases/turf/getBookings";
import { addingLocation } from "../../application/usecases/turf/addingLocation";

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
            const slots = await updateSlot(TurfRepositoryImpl, id,slot,interval,noOfSlots);
            console.log(slots)
            res.status(200).json({slots});
          } catch (error: any) {
            console.log(error)
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
      },
      currentSlots:async (req: Request, res: Response) => {
        try {
            const {email,date}=req.params
            const turfDetails=await getTurfDetailsFromMail(email)
            const id=turfDetails?._id as string
            console.log(id)
            const slots = await currentSlots(TurfRepositoryImpl,id,date);
            console.log(slots)
            res.status(200).json({slots});
          } catch (error: any) {
            res.status(400).json({ message: error.message }); 
          }
      },
      deleteSlot:async (req: Request, res: Response) => {
        try {
            const id=req.params.id
            await deleteSlot(TurfRepositoryImpl,id);
            res.status(200).json({success:true});
          } catch (error: any) {
            res.status(400).json({ message: error.message }); 
          }
      },
      getBookings:async (req: Request, res: Response) => {
        try {
          console.log("hi")
          const {email}=req.body
          const turfDetails=await getTurfDetailsFromMail(email)
            const id=turfDetails?._id as string
            console.log(id)
            const bookings=await getBookings(TurfRepositoryImpl,id)
            console.log(bookings)
            res.status(200).json(bookings);
          } catch (error: any) {
            res.status(400).json({ message: error.message }); 
          }
      },
      addLocation:async (req: Request, res: Response) => {
        try {
            const {locationName,latitude,longitude}=req.body
            await addingLocation(TurfRepositoryImpl,locationName,latitude,longitude)
          } catch (error: any) {
            res.status(400).json({ message: error.message }); 
          }
      } 
}
 