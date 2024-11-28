import crypto from "crypto";
import { UserModel } from "../../infrastructure/database/models/userModel";
import { sendOtpEmail } from "../../infrastructure/services/emailService";
import { TurfModel } from "../../infrastructure/database/models/turfModel";

export const generateOtp = async (
  email: string,
  person: number
): Promise<void> => {
  try {
     let user;
    if (person == 1) {
      user = await UserModel.findOne({ email });
    }else if(person==0){
       user = await TurfModel.findOne({ email });
    }
    if (!user) {
      throw new Error("User not found");
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(otp)
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();
    await sendOtpEmail(email, otp);
  } catch (error) {
    console.error("Error generating OTP:", error);
    throw error;
  }
};
