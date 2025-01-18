import { Slot } from "../../../domain/entities/Turf"
import { UserRepository } from "../../../domain/repositories/UserRepository"


export const getSlots=async(userRepository:UserRepository,id:any,date:any):Promise<Slot[]|null>=>{
    let slots=userRepository.findSlots(id,date)
    return slots 
}