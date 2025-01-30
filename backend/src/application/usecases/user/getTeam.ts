import { UserRepository } from "../../../domain/repositories/UserRepository"
import { Team } from "../../../domain/entities/Team"


export const getTeam=async(userRepository:UserRepository,id:string):Promise<Team|null>=>{
    let team=userRepository.getTeam(id)
    return team
}