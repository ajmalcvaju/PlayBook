import { User } from "../../../domain/entities/User"
import { UserRepository } from "../../../domain/repositories/UserRepository"

export const getUserName=async(userRepository:UserRepository,id:string):Promise<string>=>{
    const userName=userRepository.userName(id)
    return userName
}