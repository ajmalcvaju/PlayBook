import { User } from "../../../domain/entities/User"
import { UserRepository } from "../../../domain/repositories/UserRepository"

export const getUserDetails=async(userRepository:UserRepository,id:string|null):Promise<User>=>{
    const user=userRepository.getUserDetails(id)
    return user
}