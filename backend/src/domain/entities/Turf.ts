export interface Turf {
  turfName: string;
  email: string;
  mobileNumber: string;
  password: string;
  otp?: string;
  otpExpiresAt?: Date;
  isVerified?: number;
  isApproved?: number;
}
export interface TurfDetails{ 
    turfAddress?: string;
    turfMap?: string;
    latitude?: number;
    longitude?: number;
    turfOverview?: string;
    facilities?:string
    gallery?: string[];
}