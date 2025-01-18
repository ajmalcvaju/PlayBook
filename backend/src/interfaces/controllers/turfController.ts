import { Request, Response } from "express";
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
import { getMessages } from "../../application/usecases/getMessages";
import { MessageRepositoryImpl } from "../../infrastructure/database/repositories/MessageRepositoryImpl";
import mongoose from "mongoose";
import { getTurfByMail } from "../../application/usecases/turf/getTurfByMail";
import { getUsers } from "../../application/usecases/turf/getUsers";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../infrastructure/services/token";
import { cancelBooking } from "../../application/usecases/turf/cancellBooking";
import { changePassword } from "../../application/usecases/turf/changePassword";

interface CustomRequest extends Request {
  files?: Express.Multer.File[];
}

export const turfController = {
  list: async (req: Request, res: Response) => {
    try {
      const turf = await listTurf(TurfRepositoryImpl, req.body);
      console.log(turf.email);
      await generateOtp(turf.email, 0);
      res
        .status(200)
        .json({ message: "Turf registered. OTP sent to your email." });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  validateOtp: async (req: Request, res: Response) => {
    try {
      const { email, otp } = req.body;
      const token = await validateOtp(email, otp, 0);
      const turf = await getTurfByMail(TurfRepositoryImpl, email);
      const accessToken = generateAccessToken({ id: email, role: "turf" });
      res.cookie("accessToken", accessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 5 * 60 * 1000,
      });
      const refreshToken = generateRefreshToken({
        id: email,
        role: "turf",
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      // res.cookie("auth_token", token, {httpOnly: true,maxAge: 86400000});
      res
        .status(200)
        .json({
          message: "OTP verified successfully. You can now log in.",
          token,
          turf,
        });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  resendOtp: async (req: Request, res: Response) => {
    try {
      console.log(req.body.email);
      await generateOtp(req.body.email, 0);
      res
        .status(200)
        .json({
          message: "A new OTP has been sent to your registered email. ",
        });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  login: async (req: Request, res: Response) => {
    try {
      console.log(req.body);
      const { email, password } = req.body;
      const { turf, token } = await loginTurf(
        TurfRepositoryImpl,
        email,
        password
      );
      // res.cookie("auth_token", token, {httpOnly: true,maxAge: 86400000});
      const accessToken = generateAccessToken({ id: email, role: "turf" });
      res.cookie("accessToken", accessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 5 * 60 * 1000,
      });
      const refreshToken = generateRefreshToken({
        id: email,
        role: "turf",
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json({ message: "You can now log in.", token, turf });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  forgotPassword: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      await generateOtp(email, 0);
      res
        .status(200)
        .json({
          message: "A new OTP has been sent to your registered email. ",
        });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  verifyOtpForgotPassword: async (req: Request, res: Response) => {
    try {
      console.log(req.body);
      const { email,otp} = req.body;
      const token = await validateOtp(email, otp, 0);
      res.status(200).json({message: "OTP verified successfully. You can now change your password.",token,});
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  changeForgottedPassword: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const turfDetails= await getTurfDetailsFromMail(email);
      const turfId = turfDetails?._id as string;
      const turf=await changePassword(TurfRepositoryImpl, turfId, password);
      const accessToken = generateAccessToken({ id: email, role: "turf" });
      res.cookie("accessToken", accessToken, {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 5 * 60 * 1000,
      });
      const refreshToken = generateRefreshToken({ id: email, role: "turf" });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json({ message: "You can now log in.", accessToken, turf });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  updateTurfDetails: async (req: Request, res: Response) => {
    try {
      const customReq = req as CustomRequest;
      if (!customReq.files) throw new Error("No files uploaded");
      const uploadedImages = await uploadedImage(customReq.files);
      const { email, ...data } = customReq.body;
      const updatedData = { ...data, ...{ gallery: uploadedImages } };
      console.log(updatedData);
      const updatedTurf = await updateTurfDetails(
        TurfRepositoryImpl,
        email,
        updatedData
      );

      res.status(200).json(updatedTurf);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  slotUpdate: async (req: Request, res: Response) => {
    try {
      const email = req.body.email;
      const { startDate, endDate, ...prices } = req.body.data;
      const turfDetails = await getTurfDetailsFromMail(email);
      const id = turfDetails?._id as string;
      const slots = await updateSlot(
        TurfRepositoryImpl,
        id,
        startDate,
        endDate,
        prices
      );
      res.status(200).json({ slots });
    } catch (error: any) {
      console.log(error);
      res.status(400).json({ message: error.message });
    }
  },
  getSlots: async (req: Request, res: Response) => {
    try {
      const email = req.params.email;
      const turfDetails = await getTurfDetailsFromMail(email);
      const id = turfDetails?._id as string;
      console.log(id);
      const slots = await getSlots(TurfRepositoryImpl, id);
      res.status(200).json({ slots });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  currentSlots: async (req: Request, res: Response) => {
    try {
      const { email, date } = req.params;
      const turfDetails = await getTurfDetailsFromMail(email);
      const id = turfDetails?._id as string;
      console.log(id);
      const slots = await currentSlots(TurfRepositoryImpl, id, date);
      console.log(slots);
      res.status(200).json({ slots });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  deleteSlot: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      await deleteSlot(TurfRepositoryImpl, id);
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  getBookings: async (req: Request, res: Response) => {
    try {
      console.log("hi");
      const { email } = req.params;
      const turfDetails = await getTurfDetailsFromMail(email);
      const id = turfDetails?._id as string;
      const bookings = await getBookings(TurfRepositoryImpl, id);
      res.status(200).json(bookings);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  addLocation: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const turfDetails = await getTurfDetailsFromMail(email);
      const id = turfDetails?._id as string;
      const { locationName, latitude, longitude } = req.body;
      const location = await addingLocation(
        TurfRepositoryImpl,
        id,
        locationName,
        latitude,
        longitude
      );
      res.status(200).json({ message: "success" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  turfDetais: async (req: Request, res: Response) => {
    try {
      const { email } = req.params;
      const turfDetails = await getTurfDetailsFromMail(email);
      res.status(200).json(turfDetails);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  getMessages: async (req: Request, res: Response) => {
    try {
      const sender = req.query.sender as string;
      const reciever = req.query.reciever as string;
      const messages = await getMessages(
        MessageRepositoryImpl,
        sender,
        reciever
      );
      res.status(200).json({ messages });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  getUserForChat: async (req: Request, res: Response) => {
    try {
      const users = await getUsers(TurfRepositoryImpl);
      res.status(200).json({ users });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  cancellBooking: async (req: Request, res: Response) => {
    try {
      const slotId = req.body.slotId as string;
      const bookingId = req.body.bookingId as string;
      await cancelBooking(TurfRepositoryImpl, slotId, bookingId);
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
};
