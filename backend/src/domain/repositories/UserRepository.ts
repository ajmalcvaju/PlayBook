import { Slot } from "../entities/Turf";
import { User } from "../entities/User";
import { UpdateResult } from "mongodb";
export interface UserRepository{
  createUser(user: User): Promise<User>;
  findByEmail(email: string,): Promise<User | null>;
  findSlots(id: any,date:any): Promise<Slot[] | null>
  confirmBooking(id:string,userId:string|null):Promise<UpdateResult>
  getIdByMail(email: string): Promise<string | null>
}