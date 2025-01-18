import { AdminRepository } from "../../../domain/repositories/AdminRepository";
import { UserModel } from "../models/userModel";
import { User } from "../../../domain/entities/User";
import { Turf } from '../../../domain/entities/Turf';
import { Slot } from "../../../domain/entities/Turf";
import { TurfModel } from "../models/turfModel";
import { SlotModel } from "../models/slotModel";
import { BookingModel } from "../models/BookingModel";
import ReportModel from "../models/reportModel";
import { ReviewModel } from "../models/reviewModel";

export const AdminRepositoryImpl: AdminRepository= {
  async findUsers(): Promise<any[]> {
  const users = await UserModel.find();
  const bookings= await BookingModel.aggregate([{$group: {_id: "$userId",count: { $sum: 1 },},},
      {$project: {userId: "$_id",count: 1, _id: 0,}}]);
    return [users,bookings]
},
async findTurfs(): Promise<any[]> {
    const turfs = await TurfModel.find();
    const reports = await ReportModel.find();
    const bookings= await BookingModel.aggregate([{$group: {_id: "$turfId",count: { $sum: 1 },},},
      {$project: {turfId: "$_id",count: 1, _id: 0,}}]);
    return [turfs,reports,bookings]
},
async getBookings(): Promise<any[] | any> {
  const bookings = await BookingModel.find({})
      .populate("turfId", "turfName")
      .populate("slotId", "_id time slotNumber date")
      .populate("userId", "firstName lastName mobileNumber email")
      .sort({ createdAt: -1 })
      .exec();
    console.log("Fetched bookings:", bookings);
    const flatBookings = bookings.map((booking) => {
      const user = booking.userId as User | any;
      const turf = booking.turfId as { turfName: string } | any;
      const slot = booking.slotId as Slot | any;
      return {
        _id: booking._id,
        price: booking.paid,
        status: booking.status, 
        slotId: slot?._id || null,
        time: slot?.time || null,
        date: slot?.date || null,
        slotNumber: slot?.slotNumber || null,
        turfName: turf?.turfName || "",
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        mobileNumber: user?.mobileNumber ?? "",
        email: user?.email || "",
      };
    });
    console.log("Flat bookings:", flatBookings);
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
},
async getReviews():Promise<any[]|null>{
  const reviews = await ReviewModel.find().populate({path: 'userId',select: 'firstName lastName'});;
  return reviews
},
async deleteReview(id:string):Promise<void>{
  const result = await ReviewModel.deleteOne({ _id: id });
  return
}
}