import { UserRepository } from "../../../domain/repositories/UserRepository"

export const addingLocation=async(userRepository:UserRepository,id:any,locationName:string,latitude:number,longitude:number):Promise<void>=>{
    userRepository.addLocation(id,locationName,latitude,longitude)
    return 
}