import { Turf } from "../../../domain/entities/Turf";
import { TurfRepository } from "../../../domain/repositories/TurfRepository";
import { TurfModel,TurfDocument } from "../models/turfModel";
import { TurfDetails } from "../../../domain/entities/Turf";
import { Slot } from "../../../domain/entities/Turf";
import { SlotModel } from "../models/slotModel";

interface UpdatedTurf extends Turf,TurfDetails{}
export const TurfRepositoryImpl: TurfRepository = {
  async createTurf(turf: Turf): Promise<Turf> {
    const createdTurf = await TurfModel.create(turf);
    return createdTurf.toObject();
  },
  async findByEmail(email: string): Promise<Turf | null> {
    const turf = await TurfModel.findOne({ email }); 
    return turf ? turf.toObject() : null;
  },
  async updateDetails(email: string, turfDetails: TurfDetails): Promise<UpdatedTurf> {
    const updatedTurf = await TurfModel.findOneAndUpdate(
      { email },
      { $set: turfDetails },
      { new: true }
    );
    if (!updatedTurf) {
      throw new Error("Turf not found with the provided email.");
    }
    return updatedTurf.toObject() as UpdatedTurf;
  },
  async updateSlot(turfId: string, slotDetails: Slot, interval: string, noOfSlots: string): Promise<Slot[]> {

    if (!slotDetails.time || !slotDetails.date) {
        throw new Error("The 'time' and 'date' fields are required to create a slot.");
    }
    const existingSlot = await SlotModel.findOne({
        turfId,
        date: slotDetails.date,
        time: slotDetails.time
    });

    if (existingSlot) {
        throw new Error("A slot with the same time and date already exists for this turf.");
    }
    const [baseHours, baseMinutes] = slotDetails.time.split(":").map(Number);
    const [intervalHours, intervalMinutes] = interval.split(":").map(Number);
    const baseTotalMinutes = baseHours * 60 + baseMinutes;
    const intervalTotalMinutes = intervalHours * 60 + intervalMinutes;
    const slots=[]
    const date=slotDetails.date
    const price=slotDetails.price
    for (let i = 0; i < parseInt(noOfSlots); i++) {
        const totalMinutes = baseTotalMinutes + i * intervalTotalMinutes;
        const resultHours = Math.floor(totalMinutes / 60) % 24;
        const resultMinutes = totalMinutes % 60;
        const time = `${resultHours.toString().padStart(2, "0")}:${resultMinutes.toString().padStart(2, "0")}`;
        console.log("New slot time:", time);
        const newSlot=await SlotModel.create({turfId,date,time,price});
        slots.push(newSlot)
    }
    if (!slots) {
        throw new Error("Failed to create the initial slot.");
    }
    return slots
}

,
async getSlots(turfId: string): Promise<Slot[]|void>{
  const slots = await SlotModel.find({turfId})
  if(!slots){
    throw new Error("No slot Found.");
  }
  return slots
},
async currentSlots(turfId: string,date:string): Promise<Slot[]|void>{
  const slots = await SlotModel.find({turfId,date})
  if(!slots){
    throw new Error("No slot Found.");
  }
  return slots
},
async deleteSlot(id:string): Promise<void>{
  const slots = await SlotModel.deleteOne({_id:id})
}
};
