import { Slot } from "../../../domain/entities/Turf"
import { UserRepository } from "../../../domain/repositories/UserRepository"


export const getSlotsForSell=async(userRepository:UserRepository,id:string):Promise<any[]>=>{
    let slots=userRepository.getSlotsForSell(id)
    return slots 
}