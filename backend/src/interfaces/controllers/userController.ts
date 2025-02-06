import { NextFunction, Request, Response } from "express";
import { registerUser } from "../../application/usecases/registerUser";
import { loginUser } from "../../application/usecases/loginUser";
// import { UserRepositoryImpl } from "../../infrastructure/database/repositories/UserRepositoryImpl";
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
import { addingLocation } from "../../application/usecases/user/addingLocation";
import { getUserDetails } from "../../application/usecases/user/getUserDetails";
import { cancelBooking } from "../../application/usecases/user/cancelBooking";
import { MessageRepositoryImpl } from "../../infrastructure/database/repositories/MessageRepositoryImpl";
import { getMessages } from "../../application/usecases/getMessages";
import { getUserByMail } from "../../application/usecases/user/getUserByMail";
import { changePassword } from "../../application/usecases/user/changePassword";
import { generateAccessToken, generateRefreshToken } from "../../infrastructure/services/token";
import { updateRatings } from "../../application/usecases/user/updateRatings";
import { getReviews } from "../../application/usecases/user/getReviews";
import { reportTurf } from "../../application/usecases/user/reportTurf";
import { googleAuthentication } from "../../application/usecases/user/googleAuthentication";
import { createTeam } from "../../application/usecases/user/createTeam";
import { getTeams } from "../../application/usecases/user/getTeams";
import { joinTeam } from "../../application/usecases/user/joinTeam";
import { getTeam } from "../../application/usecases/user/getTeam";
import { leftRemoveTeam } from "../../application/usecases/user/leftRemoveTeam";
import { sellSlot } from "../../application/usecases/user/sellSlot";
import { getSlotsForSell } from "../../application/usecases/user/getSlotsForSell";
import { joinSlot } from "../../application/usecases/user/joinSlot";

import { AuthUseCase } from "../../application/usecases/AuthUseCase";
import { UserRepositoryImpl } from "../../infrastructure/database/repositories/UserRepositoryImpl";


const authUseCase = new AuthUseCase(new UserRepositoryImpl());
export class userController {
  static async register(req: Request, res: Response) {
    try {
      const user = await authUseCase.registerUser(req.body);
      await authUseCase.generateOtp(user.email, 1);
      res.status(200).json({ message: "User registered. OTP sent to your email." });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async validateOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      console.log(req.body);
      const token = await authUseCase.validateOtp(email, otp, 1);
      const user = await authUseCase.getUserByMail(email);

      const accessToken = generateAccessToken({ id: email, role: "user" });
      res.cookie("accessToken", accessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 5 * 60 * 1000,
      });

      const refreshToken = generateRefreshToken({ id: email, role: "user" });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: "OTP verified successfully. You can now log in.",
        token,
        user,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { user, token } = await authUseCase.loginUser(email, password);

      const accessToken = generateAccessToken({ id: email, role: "user" });
      res.cookie("accessToken", accessToken, {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 5 * 60 * 1000,
      });

      const refreshToken = generateRefreshToken({ id: email, role: "user" });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({ message: "You can now log in.", accessToken, user });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      await authUseCase.generateOtp(email, 1);
      res.status(200).json({ message: "A new OTP has been sent to your registered email." });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async verifyOtpForgotPassword(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      await authUseCase.validateOtp(email, otp, 1);
      res.status(200).json({ message: "OTP Verified Successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async changeForgottenPassword(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await authUseCase.getUserByMail(email);
      if (!user) throw new Error("User not found");

      const accessToken = generateAccessToken({ id: email, role: "user" });
      res.cookie("accessToken", accessToken, {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 5 * 60 * 1000,
      });

      const refreshToken = generateRefreshToken({ id: email, role: "user" });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({user,message: "Password changed successfully. You can now log in." });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async resendOtp(req: Request, res: Response) {
    try {
      await authUseCase.generateOtp(req.body.email, 1);
      res.status(200).json({ message: "A new OTP has been sent to your registered email." });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async googleAuth(req: Request, res: Response) {
    try {
      const { fullname, email } = req.body;
      const user = await authUseCase.googleAuthentication(email, fullname);
      console.log(user);
      const accessToken = generateAccessToken({ id: user?.email as string, role: "user" });
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      const refreshToken = generateRefreshToken({ id: user?.email as string, role: "user" });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({ user, message: "You logged in successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

// export const userController = {
//   getTurf: async (req: Request, res: Response) => {
//     try {
//       const turfs = await getTurfs();
//       res.status(200).json({ turfs });
//     } catch (error: any) {
//       res.status(400).json({ message: error.message });
//     }
//   },
//   getTurfDetails: async (req: Request, res: Response) => {
//     try {
//       const { id } = req.params;
//       const turfDetails = await getTurfDetails(id);
//       if (!turfDetails) {
//         res.status(404).json({ message: "Turf not found" });
//       } else {
//         res.status(200).json({ turfDetails });
//       }
//     } catch (error: any) {
//       res.status(400).json({ message: error.message });
//     }
//   },
//   getSlots: async (req: Request, res: Response) => {
//     try {
//       const { id, date } = req.query;
//       const slots = await getSlots(UserRepositoryImpl, id, date);
//       console.log(slots);
//       res.status(200).json({ slots });
//     } catch (error: any) {
//       res.status(400).json({ message: error.message });
//     }
//   },
//   confirmBooking: async (req: Request, res: Response) => {
//     try {
//       const { slotId, email,turfId,status } = req.body;
//       const userId = await getIdFrommail(UserRepositoryImpl, email);
//       const book = await confirmBooking(UserRepositoryImpl, slotId,userId,turfId);
//       console.log(book);
//       res.status(200).json({ message: "Slot Booked successfully" });
//     } catch (error: any) {
//       res.status(400).json({ message: error.message });
//     }
//   },
//   getBookings: async (req: Request, res: Response) => {
//     try {
//       const { email } = req.params;
//       const userId = await getIdFrommail(UserRepositoryImpl, email);
//       const bookings = await getBookings(UserRepositoryImpl, userId);
//       res.status(200).json(bookings);
//     } catch (error: any) {
//       res.status(400).json({ message: error.message });
//     }
//   },
//   chat: async (req: Request, res: Response) => {
//     try {
//       console.log("you got a message");
//     } catch (error: any) {
//       res.status(400).json({ message: error.message });
//     }
//   },
//   addLocation: async (req: Request, res: Response) => {
//     try {
//       const { email } = req.body;
//       const userId = await getIdFrommail(UserRepositoryImpl, email);
//       console.log(userId);
//       const { locationName, latitude, longitude } = req.body;
//       console.log(req.body);
//       const location = await addingLocation(
//         UserRepositoryImpl,
//         userId,
//         locationName,
//         latitude,
//         longitude
//       );
//       res.status(200).json({ message: "success" });
//     } catch (error: any) {
//       res.status(400).json({ message: error.message });
//     }
//   },
//   getLocation: async (req: Request, res: Response) => {
//     try {
//       const { email } = req.query;
//       console.log(email);
//       const userId = await getIdFrommail(UserRepositoryImpl, email);
//       console.log(userId);
//       const user = await getUserDetails(UserRepositoryImpl, userId);
//       console.log(user);
//       res.status(200).json({ user });
//     } catch (error: any) {
//       res.status(400).json({ message: error.message });
//     }
//   },
//   cancellBooking: async (req: Request, res: Response) => {
//     try {
//       const slotId= req.body.slotId as string;
//       const bookingId=req.body.bookingId as string
//       const refund=req.body.refundPercentage
//       await cancelBooking(UserRepositoryImpl,slotId,bookingId,refund);
//       res.status(200).json({ success: true });
//     } catch (error: any) {
//       res.status(400).json({ message: error.message });
//     }
//   },
//   getMessages: async (req: Request, res: Response) => {
//     try {
//       const sender = req.query.sender as string;
//       const reciever = req.query.reciever as string;
//       const messages = await getMessages(
//         MessageRepositoryImpl,
//         sender,
//         reciever
//       );
//       res.status(200).json({ messages });
//     } catch (error: any) {
//       res.status(400).json({ message: error.message });
//     }
//   },
//   changePassword: async (req: Request, res: Response) => {
//     try {
//       const { id, password } = req.body;
//       await changePassword(UserRepositoryImpl, id, password);
//       res.status(200).json({ messages: "Password updated Successfully" });
//     } catch (error: any) {
//       res.status(400).json({ message: error.message });
//     }
//   },
//   giveRatings: async (req: Request, res: Response) => {
//     try {
//       const review = await updateRatings(UserRepositoryImpl, req.body);
//       res.status(200).json({ review, messages: "Review Updated Successfully" });
//     } catch (error: any) {
//       res.status(400).json({ message: error.message });
//     }
//   },
//   getRatings: async (req: Request, res: Response) => {
//     try {
//       const {id}=req.params
//       const review=await getReviews(UserRepositoryImpl,id)
//       res.status(200).json({ Review:review[0],rating:review[1],votes:review[2]});
//     } catch (error: any) {
//       res.status(400).json({ message: error.message });
//     }
//   },
//   report:async (req: Request, res: Response) => {
//     try {
//       const {issue,turfId,userId}=req.body
//       await reportTurf(UserRepositoryImpl,turfId,userId,issue)
//       res.status(200).json({message:"Turf Reported Successfully"});
//     } catch (error: any) {
//       res.status(400).json({ message: error.message });
//     }
//   },
//   createTeam:async (req: Request, res: Response) => {
//     try {
//       const { teamName,maxMembers, privacy,userId}=req.body
//       const team=await createTeam(UserRepositoryImpl,teamName,maxMembers, privacy,userId)
//       res.status(200).json({team,message:"Created team Successfully"});
//     } catch (error: any) {
//       res.status(400).json({ message: error.message });
//     }
//   },
//   getTeams:async (req: Request, res: Response) => {
//     try {
//       const teams=await getTeams(UserRepositoryImpl)
//       res.status(200).json({teams,message:"Fetched teams Successfully"});
//     } catch (error: any) {
//       res.status(400).json({ message: error.message });
//     }
//   },
//   joinTeam:async (req: Request, res: Response) => {
//     try {
//       const {teamId,userId}=req.body
//       console.log(req.body)
//       const teams=await joinTeam(UserRepositoryImpl,teamId,userId)
//       res.status(200).json({teams,message:"Fetched teams Successfully"});
//     } catch (error: any) {
//       res.status(400).json({ message: error.message });
//     }
//   },
//   getTeam:async (req: Request, res: Response) => {
//     try {
//       const {id}=req.params
//       const team=await getTeam(UserRepositoryImpl,id)
//       res.status(200).json({team,message:"Fetched team Successfully"});
//     } catch (error: any) {
//       res.status(400).json({ message: error.message });
//     }
//   },
//   getSlotForSell: async (req: Request, res: Response) => {
//     try {
//       const { email } = req.params;
//       const userId = await getIdFrommail(UserRepositoryImpl, email) as string;
//       const bookings = await getSlotsForSell(UserRepositoryImpl, userId);
//       res.status(200).json(bookings);
//     } catch (error: any) {
//       res.status(400).json({ message: error.message });
//     }
//   },
//   leftRemoveTeam:async (req: Request, res: Response) => {
//     try {
//       const {teamId,userId}=req.body
//       console.log(req.body)
//       const team=await leftRemoveTeam(UserRepositoryImpl,teamId,userId)
//       res.status(200).json({team,message:"removed/left Successfully"});
//     } catch (error: any) {
//       res.status(400).json({ message: error.message });
//     }
//   },
//   sellSlot:async (req: Request, res: Response) => {
//     try {
//       console.log(req.body)
//       const {teamId,userId,vacancy,slotId}=req.body
//       const team=await sellSlot(UserRepositoryImpl,teamId,userId,vacancy,slotId)
//       res.status(200).json({team,message:"Your Slot sold Successfully"});
//     } catch (error: any) {
//       res.status(400).json({ message: error.message });
//     }
//   },
//   joinSlot:async (req: Request, res: Response) => {
//     try {
//       const {teamId,slotId,userId}=req.body
//       const team=await joinSlot(UserRepositoryImpl,teamId,slotId,userId)
//       res.status(200).json({team,message:"Your Joined sold Successfully"});
//     } catch (error: any) {
//       res.status(400).json({ message: error.message });
//     }
//   }
// };
