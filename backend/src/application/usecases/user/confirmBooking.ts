import { UpdateResult } from "mongodb";
import { UserRepository } from "../../../domain/repositories/UserRepository"



export const confirmBooking=async(userRepository:UserRepository,id:any,userId:string|null,turfId:string):Promise<UpdateResult>=>{
    let slots=userRepository.confirmBooking(id,userId,turfId)
    return slots 
} 