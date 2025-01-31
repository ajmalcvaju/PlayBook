import { UserRepository } from "../../../domain/repositories/UserRepository"
import { Team } from "../../../domain/entities/Team"

export const sellSlot=async(userRepository:UserRepository,teamId:string,userId:string,vacancy:number,slotId:string): Promise<Team | null>=>{
    const team=userRepository.sellSlot(teamId,userId,vacancy,slotId)
    return team
}
