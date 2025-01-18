import { User } from "../../../domain/entities/User"
import { UserRepository } from "../../../domain/repositories/UserRepository"
import bcrypt from "bcryptjs"

export const changePassword=async(userRepository:UserRepository,id:string,password:string):Promise<User|null>=>{
    const hashedPassword=await bcrypt.hash(password,10)
    const user=userRepository.changePassword(id,hashedPassword)
    return user
}


