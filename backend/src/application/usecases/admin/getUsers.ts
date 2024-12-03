import { User } from "../../../domain/entities/User"
import { AdminRepository } from "../../../domain/repositories/AdminRepository"


export const getUsers=async(adminRepository:AdminRepository):Promise<User[]|null>=>{
    let users=adminRepository.findUsers()
    return users
}