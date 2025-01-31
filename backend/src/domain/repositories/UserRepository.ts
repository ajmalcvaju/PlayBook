import { Review } from "../entities/Review";
import { Slot } from "../entities/Turf";
import { User } from "../entities/User";
import { Team } from "../entities/Team";
import { UpdateResult } from "mongodb";
export interface UserRepository{
  createUser(user: User): Promise<User>;
  findByEmail(email: string,): Promise<User | null>;
  findSlots(id: any,date:any): Promise<Slot[] | null>
  confirmBooking(id:string,userId:string|null,turfId:string):Promise<UpdateResult>
  getIdByMail(email: string): Promise<string | null>
  getBookings(id:string):Promise<any[]>
  addLocation(id:string,locationName:string,latitude:number,longitude:number): Promise<void>
  getUserDetails(id:string|null):Promise<any|null>
  cancellBooking(slotId:string,bookingId:string):Promise<any|null>
  changePassword(id:string|null,password:string):Promise<User|null>
  updateRatings(review:Review): Promise<Review>
  getReviews(turfId:string): Promise<[Review[], number, number]>
  report(turfId:string,userId:string,issue:string): Promise<void>
  userName(userId: string): Promise<string>
  googleAuthentication(email: string,name:string,password:string): Promise<User | null>
  createTeam(teamName:string,maxMembers:number, privacy:'pubic'|'private',userId:string): Promise<Team>
  getTeams(): Promise<Team[]>
  joinTeam(teamId:string,userId:string):Promise<Team[]>
  getTeam(id:string):Promise<Team|null>
  leftRemoveTeam(teamId:string,userId:string):Promise<Team|null>
  sellSlot(teamId:string,userId:string,vacancy:number,slotId:string): Promise<Team | null>
  getSlotsForSell(id: string): Promise<any[]> 
  joinSlot(teamId:string,slotId:string,userId:string): Promise<Team | null>
}