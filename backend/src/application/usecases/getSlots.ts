import { Slot } from "../../domain/entities/Turf";
import { TurfRepository } from "../../domain/repositories/TurfRepository";
import { SlotModel } from "../../infrastructure/database/models/slotModel";
import { TurfDocument } from "../../infrastructure/database/models/turfModel";

export const getSlots=async(turfRepository:TurfRepository,id:string):Promise<Slot[]|void>=>{
    let slots=turfRepository.getSlots(id)
    return slots
}