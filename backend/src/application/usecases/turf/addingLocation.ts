import { Slot } from "../../../domain/entities/Turf"
import { TurfRepository } from "../../../domain/repositories/TurfRepository"

export const addingLocation=async(turfRepository:TurfRepository,id:any,locationName:string,latitude:number,longitude:number):Promise<void>=>{
    turfRepository.addLocation(id,locationName,latitude,longitude)
    return 
}