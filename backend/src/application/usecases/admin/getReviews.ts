import { AdminRepository } from "../../../domain/repositories/AdminRepository"


export const getReviews=async(adminRepository:AdminRepository):Promise<any[]|null>=>{
    let reviews=adminRepository.getReviews()
    return reviews
}