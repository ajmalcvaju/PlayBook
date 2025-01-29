import { UserRepository } from "../../../domain/repositories/UserRepository"
import { Team } from "../../../domain/entities/Team"


export const getTeams=async(userRepository:UserRepository):Promise<Team[]|[]>=>{
    let teams=userRepository.getTeams()
    return teams 
}