import { Slot } from "../../../domain/entities/Turf"
import { UserRepository } from "../../../domain/repositories/UserRepository"

export const cancelBooking=async(userRepository:UserRepository,slotId:string,bookingId:string,refund:number):Promise<any|null>=>{
    userRepository.cancellBooking(slotId,bookingId,refund)
    return 
}


