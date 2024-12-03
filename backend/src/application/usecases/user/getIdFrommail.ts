
import { UserRepository } from "../../../domain/repositories/UserRepository"



export const getIdFrommail=async(userRepository:UserRepository,email:any):Promise<string | null>=>{
    let id=userRepository.getIdByMail(email)
    return id
} 