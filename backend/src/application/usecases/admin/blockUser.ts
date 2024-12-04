import { AdminRepository } from "../../../domain/repositories/AdminRepository"


export const blockUser=async(adminRepository:AdminRepository,id:any,block:number):Promise<void>=>{
    let bookings=adminRepository.blockUser(id,block)
}