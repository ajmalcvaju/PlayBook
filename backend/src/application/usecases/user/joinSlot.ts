import { Team } from "../../../domain/entities/Team"
import { UserRepository } from "../../../domain/repositories/UserRepository"


export const joinSlot=async(userRepository:UserRepository,teamId:string,slotId:string,userId:string):Promise<Team | null>=>{
    let team=userRepository.joinSlot(teamId,slotId,userId)
    return team 
}