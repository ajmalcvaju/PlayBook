import { User } from "../../../domain/entities/User"
import { UserRepository } from "../../../domain/repositories/UserRepository"
import bcrypt from "bcryptjs"

export const googleAuthentication=async(userRepository:UserRepository,email:string,userName:string):Promise<User|null>=>{
    const password =process.env.RANDOM_PASSWORD+Math.random().toString(36).slice(-8);
    const hashedPassword=await bcrypt.hash(password,10)
    const user=userRepository.googleAuthentication(email,userName,hashedPassword)
    return user
}