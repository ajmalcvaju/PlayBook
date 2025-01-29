import { UserRepository } from "../../../domain/repositories/UserRepository"
import { Team } from "../../../domain/entities/Team"

export const joinTeam=async(userRepository:UserRepository,teamId:string,userId:string):Promise<Team[]>=>{
    const teams=userRepository.joinTeam(teamId,userId)
    return teams
}