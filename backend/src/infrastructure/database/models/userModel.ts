import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../../../domain/entities/User'; 

export interface UserDocument extends User {
}

const UserSchema = new Schema<UserDocument>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobileNumber: { type: String, required: true,unique:true },
  password: { type: String, required: true },
  otp:{ type: String},
  otpExpiresAt:{type:Date},
  isVerified:{type:Number,default:0},
  isApproved:{type:Number,default:0}
});

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);
