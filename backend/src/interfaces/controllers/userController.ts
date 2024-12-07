import { NextFunction, Request, Response } from "express";
import { registerUser } from "../../application/usecases/registerUser";
import { loginUser } from "../../application/usecases/loginUser";
import { UserRepositoryImpl } from "../../infrastructure/database/repositories/UserRepositoryImpl";
import { generateOtp } from "../../application/usecases/generateOtp";
import { validateOtp } from "../../application/usecases/validateOtp";
import { getTurfs } from "../../application/usecases/getTurfs";
import { getTurfDetails } from "../../application/usecases/getTurfDetails";
import { getSlots } from "../../application/usecases/user/getSlots";
import { SlotModel } from "../../infrastructure/database/models/slotModel";
import mongoose from "mongoose";
import { confirmBooking } from "../../application/usecases/user/confirmBooking";
import { getIdFrommail } from "../../application/usecases/user/getIdFrommail";
import { getBookings } from "../../application/usecases/user/getBookings";

export const userController = {
  register: async (req: Request, res: Response) => {
    try {
      const user = await registerUser(UserRepositoryImpl, req.body);
      await generateOtp(user.email, 1);
      res
        .status(200)
        .json({ message: "User registered. OTP sent to your email." });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  validateOtp: async (req: Request, res: Response) => {
    try {
      const { email, otp } = req.body;
      const token = await validateOtp(email, otp, 1);
      res.cookie("auth_token", token, { httpOnly: true, maxAge: 86400000 });
      res
        .status(200)
        .json({
          message: "OTP verified successfully. You can now log in.",
          token,
        });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  login: async (req: Request, res: Response) => {
    try {
      const token = await loginUser(
        UserRepositoryImpl,
        req.body.email,
        req.body.password
      );
      res.cookie("auth_token", token, { httpOnly: true, maxAge: 86400000 });
      res.status(200).json({ message: "You can now log in.", token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  getTurf: async (req: Request, res: Response) => {
    try {
      const turfs = await getTurfs();
      res.status(200).json({ turfs });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  resendOtp: async (req: Request, res: Response) => {
    try {
      await generateOtp(req.body.email, 1);
      res.status(200).json({ message: "OTP resent to your email." });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  getTurfDetails: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const turfDetails=await getTurfDetails(id)
      if (!turfDetails) {
        res.status(404).json({ message: "Turf not found" });
      }
      else{
        res.status(200).json({ turfDetails });
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  getSlots :async (req: Request, res: Response) => {
    try {
      const { id, date } = req.query;
      const slots = await getSlots(UserRepositoryImpl,id,date);
      console.log(slots)
      res.status(200).json({ slots });
    } catch (error:any) {
      res.status(400).json({ message: error.message }); 
    }
  },
  confirmBooking:async (req: Request, res: Response) => {
    try {
      const { slotId,email } = req.body;
      const userId=await getIdFrommail(UserRepositoryImpl,email)
      await confirmBooking(UserRepositoryImpl,slotId,userId);
      res.status(200).json({ message:"Slot Booked successfully" });
    } catch (error:any) {
      res.status(400).json({ message: error.message }); 
    }
  },
  getBookings:async (req: Request, res: Response) => {
    try {
      const {email}=req.body
      const userId=await getIdFrommail(UserRepositoryImpl,email)
      console.log(userId)
        const bookings=await getBookings(UserRepositoryImpl,userId)
        res.status(200).json(bookings);
    } catch (error:any) {
      res.status(400).json({ message: error.message }); 
    }
  },
  chat:async (req: Request, res: Response) => {
    try {
      
    } catch (error:any) {
      res.status(400).json({ message: error.message }); 
    }
  }
};
