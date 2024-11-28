export interface User{
    firstName:string;
    lastName:string;
    email:string;
    mobileNumber:string;
    password:string;
    otp?:string,
    otpExpiresAt?:Date,
    isVerified?:number,
    isApproved?:number
}