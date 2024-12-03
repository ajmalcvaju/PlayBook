import { User } from "../../../domain/entities/User";
import { Slot } from "../../../domain/entities/Turf";
import { UserRepository } from "../../../domain/repositories/UserRepository";
import { UserModel, UserDocument } from "../models/userModel";
import { SlotModel } from "../models/slotModel";
import { UpdateResult } from "mongodb";
import mongoose from "mongoose";

export const UserRepositoryImpl: UserRepository = {
  async createUser(user: User): Promise<User> {
    const createdUser = await UserModel.create(user);
    return createdUser.toObject();
  },
  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    return user ? user.toObject() : null;
  },
  async findSlots(id:string,date:any): Promise<Slot[] | null> {
    // const groupedSlots = await SlotModel.aggregate([
    //   {$match: { turfId: new mongoose.Types.ObjectId(id), date }},
    //   {$group: {_id: "$price",slots: { $push: "$$ROOT" },},},
    //   {$sort: { time: 1 },},
    // ]);
    const groupedSlots = await SlotModel.find({turfId:id,date})
    return groupedSlots  ? groupedSlots  : null;
  },
  async confirmBooking(id:string,userId:string|null):Promise<UpdateResult>{
    const result = await SlotModel.updateOne({ _id: id }, { isBooked: true,userId });
         return result
  },
  async getIdByMail(email: string): Promise<string | null> {
    const user: User | null = await UserModel.findOne({ email });
    return user ? user._id.toString() : null;
  }
};
