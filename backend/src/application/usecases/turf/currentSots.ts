import { Slot } from "../../../domain/entities/Turf"
import { TurfRepository } from "../../../domain/repositories/TurfRepository"

export const currentSlots=async(turfRepository:TurfRepository,id:any,date:any):Promise<Slot[]|void>=>{
    let slots=turfRepository.currentSlots(id,date)
    return slots 
}