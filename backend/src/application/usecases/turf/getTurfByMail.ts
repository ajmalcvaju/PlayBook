import { Turf } from "../../../domain/entities/Turf"
import { TurfRepository } from "../../../domain/repositories/TurfRepository"


export const getTurfByMail=async(turfRepository:TurfRepository,email:string):Promise<Turf|null>=>{
    let turf=turfRepository.findByEmail(email)
    return turf 
} 