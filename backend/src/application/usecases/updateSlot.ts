
import { Slot, Turf, TurfDetails } from "../../domain/entities/Turf";
import { TurfRepository } from "../../domain/repositories/TurfRepository";

export const updateSlot = async (
    turfrepository: TurfRepository,
    id: string,
    slot: Partial<Slot>,
    interval:string,
    noOfSlots:string
  ): Promise<Slot[]> => {
    return await turfrepository.updateSlot(id, slot,interval,noOfSlots);
  };
  
