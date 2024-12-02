import { Slot, Turf, TurfDetails } from "../entities/Turf";

export interface TurfRepository{
  createTurf(turf:Turf): Promise<Turf>;
  findByEmail(email: string): Promise<Turf | null>;
  updateDetails(email:string,details:Partial<TurfDetails>): Promise<Turf>;
  updateSlot(id:string,Slot:Partial<Slot>,interval:string,noOfSlots:string): Promise<Slot[]>;
  getSlots(id:string): Promise<Slot[]|void>;
}
