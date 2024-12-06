import { Slot, Turf } from "../entities/Turf";
import { User } from "../entities/User";

export interface AdminRepository{
  findUsers(): Promise<User[]|null>,
  findTurfs(): Promise<Turf[] | null>
  getBookings():Promise<any[]>
  blockUser(id:string,block:boolean):Promise<User[]>
  blockTurf(id:string,block:boolean):Promise<Turf[]>
}