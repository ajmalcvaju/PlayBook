import { User } from "../../../domain/entities/User"
import { UserRepository } from "../../../domain/repositories/UserRepository"


export const getUserByMail=async(userRepository:UserRepository,email:string):Promise<User|null>=>{
    let user=await userRepository.findByEmail(email)
    return user 
}