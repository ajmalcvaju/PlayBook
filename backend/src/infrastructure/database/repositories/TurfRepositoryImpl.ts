import { Turf } from "../../../domain/entities/Turf";
import { TurfRepository } from "../../../domain/repositories/TurfRepository";
import { TurfModel,TurfDocument } from "../models/turfModel";
import { TurfDetails } from "../../../domain/entities/Turf";
import { Slot } from "../../../domain/entities/Turf";
import { SlotModel } from "../models/slotModel";
import { User } from "../../../domain/entities/User";
import { time } from "console";
import { UserModel } from "../models/userModel";
import { BookingModel } from "../models/BookingModel";
const { RRule, RRuleSet } = require('rrule');
import mongoose from "mongoose";

interface UpdatedTurf extends Turf,TurfDetails{}
export const TurfRepositoryImpl: TurfRepository = {
  async createTurf(turf: Turf): Promise<Turf> {
    const createdTurf = await TurfModel.create(turf);
    return createdTurf.toObject();
  },
  async findByEmail(email: string): Promise<Turf | null> {
    const turf = await TurfModel.findOne({ email,isApproved:true }); 
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
  async updateSlot(turfId: string, startDate: Date, endDate: Date,prices:{[key: string]: string}): Promise<Slot[]> {
    console.log(turfId,startDate,endDate,prices)
    const calculatePrice = (hour: number, day: number): number => {
        let basePrice: number;
        if (hour >= 0 && hour < 6) {
            basePrice = Number(prices.slot1);
        } else if (hour >= 6 && hour < 11) {
            basePrice = Number(prices.slot2);
        } else if (hour >= 11 && hour < 18) {
            basePrice = Number(prices.slot3);
        } else if (hour >= 18 && hour <= 23) {
            basePrice = Number(prices.slot4);
        } else {
            throw new Error('Invalid hour range');
        }
        if (day === 0){
          if (hour >= 0 && hour < 6) {
            basePrice = Number(prices.slot9);
        } else if (hour >= 6 && hour < 11) {
            basePrice = Number(prices.slot10);
        } else if (hour >= 11 && hour < 18) {
            basePrice = Number(prices.slot11);
        } else if (hour >= 18 && hour <= 23) {
            basePrice = Number(prices.slot12);
        } else {
            throw new Error('Invalid hour range');
        }
        }
        if (day === 6){
          if (hour >= 0 && hour < 6) {
            basePrice = Number(prices.slot5);
        } else if (hour >= 6 && hour < 11) {
            basePrice = Number(prices.slot6);
        } else if (hour >= 11 && hour < 18) {
            basePrice = Number(prices.slot7);
        } else if (hour >= 18 && hour <= 23) {
            basePrice = Number(prices.slot8);
        } else {
            throw new Error('Invalid hour range');
        }
        }; 
        return basePrice;
    };
    try {
        const ruleSet = new RRuleSet();
        ruleSet.rrule(
            new RRule({
                freq: RRule.DAILY,
                dtstart: new Date(startDate),
                until: new Date(endDate),
            })
        );

        const allSlots: Slot[] = [];
        const saveSlotPromises: Promise<Slot>[] = [];

        for (const date of ruleSet.all()) {
            const day = date.getDay();

            for (let hour = 0; hour < 24; hour++) {
                const price = calculatePrice(hour, day);
                const slotData = {
                    turfId,
                    date: date.toISOString().split('T')[0],
                    time: `${hour}:00`,
                    price,
                };
                const slot = new SlotModel(slotData);
                saveSlotPromises.push(slot.save());
            }
        }
        const savedSlots = await Promise.all(saveSlotPromises);
        allSlots.push(...savedSlots);
        return allSlots;
    } catch (error) {
        console.error('Error updating slots:', error);
        throw new Error('Failed to update slots');
    }
}
,
async getSlots(turfId: string): Promise<Slot[]|void>{
  const slots = await SlotModel.find({turfId}).sort({date:1,time:1}) 
  if(!slots){
    throw new Error("No slot Found.");
  }
  return slots
},
async currentSlots(turfId: string, date?: string): Promise<Slot[]> {
  console.log("turfId:", turfId, "date:", date);
  let slots: Slot[];
    slots = await SlotModel.find({ turfId, date:"2024-12-20" });
  if (slots.length === 0) {
    throw new Error("No slots found.");
  }
  return slots;
}
,
async deleteSlot(id:string): Promise<void>{
  const slots = await SlotModel.deleteOne({_id:id})
},
async getBookings(id: string): Promise<any[]> {
  const bookings = await BookingModel.find({ turfId: id })
      .populate("slotId", "_id time slotNumber date")
      .populate("userId", "firstName lastName mobileNumber email")
      .sort({ createdAt: -1 })
      .exec();

    const flatBookings = bookings.map((booking) => {
      const user = booking.userId as User | any;
      const slot = booking.slotId as Slot | any;

      return {
        _id: booking._id,
        price: booking.paid || 0,
        slotId: slot?._id?.toString() || "",
        status: booking.status || "",
        time: slot?.time || "",
        date: slot?.date || "",
        slotNumber: slot?.slotNumber || 0,
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        mobileNumber: user?.mobileNumber ?? "",
        email: user?.email || "",
      };
    });

    return flatBookings;

},
async addLocation(id:string,locationName:string,latitude:number,longitude:number): Promise<void>{
  const slots = await TurfModel.updateOne({_id:id},{locationName:locationName,latitude:latitude,longitude:longitude})
  return
},
async getUsers():Promise<User[]>{
  const users = await UserModel.find().sort({ online: 1, lastSeen: -1 });
   return users
},
  async cancellBooking(slotId:string,bookingId:string):Promise<any|null>{
    const slotObjectId =new mongoose.Types.ObjectId(slotId);
    const bookingObjectId =new mongoose.Types.ObjectId(bookingId);
    const adjustedPaid =0;
    await SlotModel.updateOne({_id:slotObjectId},{ $set: { isBooked: false },$unset: { userId: "" } });
    await BookingModel.updateOne({_id:bookingObjectId},{ $set: {status:"cancelled", paid: adjustedPaid}});
  },
  async changePassword(id:string|null,password:string):Promise<Turf|null>{
    await TurfModel.updateOne({ _id: id },{ $set: { password: password }});
    return TurfModel.findOne({ _id: id });
  }
};
