import { Turf } from "../../../domain/entities/Turf"
import { TurfRepository } from "../../../domain/repositories/TurfRepository"
import bcrypt from "bcryptjs"

export const changePassword=async(turfRepository:TurfRepository,id:string,password:string):Promise<Turf|null>=>{
    const hashedPassword=await bcrypt.hash(password,10)
    const turf=turfRepository.changePassword(id,hashedPassword)
    return turf
}


