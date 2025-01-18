import { TurfRepository } from "../../../domain/repositories/TurfRepository"

export const cancelBooking=async(turfRepository:TurfRepository,slotId:string,bookingId:string):Promise<any|null>=>{
    turfRepository.cancellBooking(slotId,bookingId)
    return 
}

 
