import { AdminRepository } from "../../../domain/repositories/AdminRepository";
import { UserModel } from "../models/userModel";
import { User } from "../../../domain/entities/User";
import { Turf } from '../../../domain/entities/Turf';
import { Slot } from "../../../domain/entities/Turf";
import { TurfModel } from "../models/turfModel";
import { SlotModel } from "../models/slotModel";

export const AdminRepositoryImpl: AdminRepository= {
  async findUsers(): Promise<User[] | null> {
    const users = await UserModel.find();
    return users
},
async findTurfs(): Promise<Turf[] | null> {
    const turfs = await TurfModel.find();
    return turfs
},
async getBookings(): Promise<Slot[] | any> {
  const bookings = await SlotModel.find({ isBooked: true })
    .select("_id time date")
    .populate("turfId", "turfName")
    .populate("userId", "firstName lastName mobileNumber email");

  const flatBookings = bookings.map((booking) => {
    const user = booking.userId as User | any;
    const turf = booking.turfId as { turfName: string } | any;

    return {
      _id: booking._id,
      time: booking.time,
      date: booking.date,
      turfName: turf?.turfName || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      mobileNumber: user?.mobileNumber || "",
      email: user?.email || "",
    };
  });
  return flatBookings;
},
async blockUser(id:string,block:boolean):Promise<User[]>{
  const result = await UserModel.updateOne({ _id: id },{ $set: { isApproved: block } });
  const users = await UserModel.find();
  return users
},
async blockTurf(id:string,block:boolean):Promise<Turf[]>{
  const result = await TurfModel.updateOne({ _id: id },{ $set: { isApproved: block } });
  const turfs = await TurfModel.find();
  return turfs
}
} 
