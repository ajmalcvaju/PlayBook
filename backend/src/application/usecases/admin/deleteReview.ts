import { User } from "../../../domain/entities/User"
import { AdminRepository } from "../../../domain/repositories/AdminRepository"


export const deleteReview=async(adminRepository:AdminRepository,id:string):Promise<void>=>{
    adminRepository.deleteReview(id)
    return
}