import { User } from "../../../domain/entities/User"
import { AdminRepository } from "../../../domain/repositories/AdminRepository"


export const blockUser=async(adminRepository:AdminRepository,id:any,block:boolean):Promise<User[]>=>{
    let users=adminRepository.blockUser(id,block)
    return users
}