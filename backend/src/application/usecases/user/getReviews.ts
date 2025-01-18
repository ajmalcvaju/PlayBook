import { Review } from "../../../domain/entities/Review"
import { UserRepository } from "../../../domain/repositories/UserRepository"


export const getReviews=async(userRepository:UserRepository,id:string):Promise<[Review[], number, number]>=>{
    return userRepository.getReviews(id)
}