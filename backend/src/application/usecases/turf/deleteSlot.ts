import { TurfRepository } from "../../../domain/repositories/TurfRepository"

export const deleteSlot=async(turfRepository:TurfRepository,id:string):Promise<void>=>{
    turfRepository.deleteSlot(id)
}