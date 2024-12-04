import { Slot } from "../../../domain/entities/Turf"
import { TurfRepository } from "../../../domain/repositories/TurfRepository"

export const getBookings=async(turfRepository:TurfRepository,id:any):Promise<Slot[]>=>{
    let bookings=turfRepository.getBookings(id)
    return bookings
}