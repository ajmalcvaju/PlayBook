import { TurfRepository } from "../../domain/repositories/TurfRepository"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const loginTurf=async(turfRepository:TurfRepository,email:string,password:string):Promise<string>=>{
    const user=await turfRepository.findByEmail(email)
    if(!user) throw new Error("Invalid Email or Password")
    const isPasswordValid=await bcrypt.compare(password,user.password)
    if(!isPasswordValid) throw new Error("Invalid Password")
    const token=jwt.sign({email:user.email,role:"turf"},process.env.JWT_SECRET_KEY as string,{expiresIn:"1d"})
    return token
}