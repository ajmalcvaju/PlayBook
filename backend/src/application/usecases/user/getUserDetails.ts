import { UserRepository } from "../../../domain/repositories/UserRepository"

export const getUserDetails=async(userRepository:UserRepository,id:string|null):Promise<void>=>{
    const user=userRepository.getUserDetails(id)
    return user
}