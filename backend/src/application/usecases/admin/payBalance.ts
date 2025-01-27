import { Turf } from "../../../domain/entities/Turf"
import { AdminRepository } from "../../../domain/repositories/AdminRepository"


export const payBalance=async(adminRepository:AdminRepository,turfId:string,balance:number):Promise<Turf|null>=>{
    let turf=adminRepository.payBalance(turfId,balance)
    return turf
}