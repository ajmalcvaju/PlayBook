import mongoose, { Schema, Document } from 'mongoose';
import { Turf } from '../../../domain/entities/Turf';
import { TurfDetails } from '../../../domain/entities/Turf';

export interface TurfDocument extends Turf,TurfDetails,Document {}

const TurfSchema = new Schema<TurfDocument>({
  turfName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobileNumber: { type: String, required: true,unique:true },
  password: { type: String, required: true },
  otp:{ type: String}, 
  otpExpiresAt:{type:Date},
  isVerified:{type:Number,default:0},
  isApproved:{type:Number,default:0},
  turfAddress: { type: String, required: false },
  turfMap: { type: String, required: false },
  latitude: { type: Number, required: false },
  longitude: { type: Number, required: false },
  turfOverview: { type: String, required: false },
  facilities: { type: String, required: false },
  gallery: { type: [String], required: false,default:["https://content.jdmagicbox.com/v2/comp/mumbai/p8/022pxx22.xx22.220811180605.h5p8/catalogue/enc-sports-turf-jk-gram-thane-west-mumbai-yhq2pyqds4.jpg"] },
});

export const TurfModel = mongoose.model<TurfDocument>('Turf', TurfSchema);
