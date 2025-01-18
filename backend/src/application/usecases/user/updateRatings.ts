import { Review } from "../../../domain/entities/Review"
import { UserRepository } from "../../../domain/repositories/UserRepository"


export const updateRatings=async(userRepository:UserRepository,review:Review):Promise<Review>=>{
    return userRepository.updateRatings(review)
} 