import { Request, Response } from "express";
import { registerUser } from "../../application/usecases/registerUser";
import { loginUser } from "../../application/usecases/loginUser";
import { UserModel } from "../../infrastructure/database/models/userModel";
import { UserRepositoryImpl } from "../../infrastructure/database/repositories/UserRepositoryImpl";
import { generateOtp } from "../../application/usecases/generateOtp";
import { validateOtp } from "../../application/usecases/validateOtp";
import jwt from "jsonwebtoken";
import { getTurfs } from "../../application/usecases/getTurfs";
import { getTurfDetails } from "../../application/usecases/getTurfDetails";

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
      console.log("by");
      res.status(400).json({ message: error.message });
    }
  },
};
