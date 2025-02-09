import { Slot, Turf } from "../entities/Turf";
import { User } from "../entities/User";

// export interface AdminRepository{
//   findUsers(): Promise<User[]|null>,
//   findTurfs(): Promise<Turf[] | null>
//   getBookings():Promise<any[]>
//   blockUser(id:string,block:boolean):Promise<User[]>
//   blockTurf(id:string,block:boolean):Promise<Turf[]>
//   getReviews():Promise<any[]|null>
//   deleteReview(id:string):Promise<void>
//   payBalance(turfId:string,balance:number):Promise<Turf|null>
// } 

export interface TurfUserAdminRepository {
  findUsers(): Promise<any[]>;
  findTurfs(): Promise<any[]>;
  blockUser(id: string, block: boolean): Promise<any[]>;
  blockTurf(id: string, block: boolean): Promise<any[]>;
}

export interface AdminBookingRepository {
  getBookings(): Promise<any[]>;
  getReviews(): Promise<any[] | null>;
  deleteReview(id: string): Promise<void>;
  payBalance(turfId: string, balance: number): Promise<any>;
}
