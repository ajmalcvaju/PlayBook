import { Turf } from "../../../domain/entities/Turf"
import { AdminRepository } from "../../../domain/repositories/AdminRepository"


export const getTurfs=async(adminRepository:AdminRepository):Promise<Turf[]|null>=>{
    let turfs=adminRepository.findTurfs()
    return turfs
}