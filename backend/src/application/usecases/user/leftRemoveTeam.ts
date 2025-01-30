import { UserRepository } from "../../../domain/repositories/UserRepository"
import { Team } from "../../../domain/entities/Team"

export const leftRemoveTeam=async(userRepository:UserRepository,teamId:string,userId:string):Promise<Team|null>=>{
    const team=userRepository.leftRemoveTeam(teamId,userId)
    return team
}