import { Slot } from "../../../domain/entities/Turf"
import { AdminRepository } from "../../../domain/repositories/AdminRepository"


export const getBookings=async(adminRepository:AdminRepository):Promise<Slot[]|any>=>{
    let bookings=adminRepository.getBookings()
    return bookings
} 