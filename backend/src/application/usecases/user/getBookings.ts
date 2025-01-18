import { Slot } from "../../../domain/entities/Turf"
import { UserRepository } from "../../../domain/repositories/UserRepository"

export const getBookings=async(userRepository:UserRepository,id:any):Promise<Slot[]>=>{
    let bookings=userRepository.getBookings(id)
    return bookings
}


