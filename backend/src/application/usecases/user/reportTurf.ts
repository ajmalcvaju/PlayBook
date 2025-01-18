import { UserRepository } from "../../../domain/repositories/UserRepository"

export const reportTurf=async(userRepository:UserRepository,turfId:string,userId:string,issue:string):Promise<void>=>{
    userRepository.report(turfId,userId,issue)
    return
}