import { Team } from "../../../domain/entities/Team"
import { UserRepository } from "../../../domain/repositories/UserRepository"
import { TeamModel } from "../../../infrastructure/database/models/TeamModel";

export const createTeam=async(userRepository:UserRepository,teamName:string,maxMembers:number, privacy:'pubic'|'private'):Promise<Team>=>{
    const existingTeam = await TeamModel.findOne({ teamName });
    if (existingTeam) {
      throw new Error('Team name already exists');
    }
    const team=userRepository.createTeam(teamName,maxMembers,privacy)
    return team
}