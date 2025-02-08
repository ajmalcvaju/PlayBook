import { Slot, Turf, TurfDetails } from "../entities/Turf";
import { User } from "../entities/User";

// export interface TurfRepository{
//   createTurf(turf:Turf): Promise<Turf>;
//   findByEmail(email: string): Promise<Turf | null>;
//   updateDetails(email:string,details:Partial<TurfDetails>): Promise<Turf>;
//   updateSlot(turfId: string,startDate:Date,endDate:Date,prices:{[key: string]: string},turfSizes: ('5 vs 5' | '7 vs 7' | '11 vs 11')[]): Promise<Slot[]>
//   getSlots(id:string): Promise<Slot[]|void>;
//   currentSlots(turfId: string,date:string): Promise<Slot[]|void>;
//   deleteSlot(id:string): Promise<void>
//   getBookings(id:string):Promise<Slot[]>
//   addLocation(id:string,locationName:string,latitude:number,longitude:number): Promise<void>
//   getUsers():Promise<User[]>
//   cancellBooking(slotId:string,bookingId:string):Promise<any|null>
//   changePassword(id:string|null,password:string):Promise<Turf|null>
// }

export interface TurfAuthRepository {
  createTurf(turf: Turf): Promise<Turf>;
  findByEmail(email: string): Promise<Turf | null>;
  updateDetails(email: string, turfDetails: TurfDetails): Promise<UpdatedTurf>;
  changePassword(id: string | null, password: string): Promise<Turf | null>;
  generateOtp(email: string, person: number): Promise<void>;
  validateOtp(email: string, otp: string, person: number): Promise<string>;
  getTurfDetailsFromMail(email: string): Promise<TurfDocument | null>;
}