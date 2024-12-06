import { Turf } from "../../../domain/entities/Turf"
import { AdminRepository } from "../../../domain/repositories/AdminRepository"


export const blockTurf=async(adminRepository:AdminRepository,id:any,block:boolean):Promise<Turf[]>=>{
    let turfs=adminRepository.blockTurf(id,block)
    return turfs
}