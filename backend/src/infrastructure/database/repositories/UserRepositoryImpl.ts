import { User } from "../../../domain/entities/User";
import { Slot, Turf } from "../../../domain/entities/Turf";
import { UserRepository } from "../../../domain/repositories/UserRepository";
import { UserModel, UserDocument } from "../models/userModel";
import { SlotModel } from "../models/slotModel";
import { UpdateResult } from "mongodb";
import mongoose from "mongoose";
import { ReviewModel } from "../models/reviewModel";
import { Review } from "../../../domain/entities/Review";
import { TurfModel } from "../models/turfModel";
import { BookingModel } from "../models/BookingModel";
import ReportModel from "../models/reportModel";
import { Report } from "../../../domain/entities/Report";
import { Team } from "../../../domain/entities/Team";
import { TeamModel } from "../models/TeamModel";
import { Types } from 'mongoose';


export const UserRepositoryImpl: UserRepository = {
  async createUser(user: User): Promise<User> {
    const createdUser = await UserModel.create(user);
    return createdUser.toObject();
  },
  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email, isApproved: true });
    return user ? user.toObject() : null;
  },
  async findSlots(id: string, date: any): Promise<Slot[] | null> {
    // const groupedSlots = await SlotModel.aggregate([
    //   {$match: { turfId: new mongoose.Types.ObjectId(id), date }},
    //   {$group: {_id: "$price",slots: { $push: "$$ROOT" },},},
    //   {$sort: { time: 1 },},
    // ]);
    const groupedSlots = await SlotModel.find({ turfId: id, date });
    return groupedSlots ? groupedSlots : null;
  },
  async confirmBooking(
    id: string,
    userId: string | null,
    turfId: string
  ): Promise<UpdateResult> {
    const result = await SlotModel.updateOne(
      { _id: id },
      { isBooked: true, userId }
    );
    const slot = await SlotModel.findOne({ _id: id });
    const price = slot ? slot.price : 0;
    const newBooking = new BookingModel({
      slotId: id,
      turfId: turfId,
      userId: userId,
      paid: price,
    });
    const savedBooking = await newBooking.save();
    return result;
  },
  async getIdByMail(email: string): Promise<string | null> {
    const user: User | null = await UserModel.findOne({ email });
    return user ? user._id.toString() : null;
  },
  async getBookings(id: string): Promise<any[]> {
    const bookings = await BookingModel.find({ userId: id })
      .populate("slotId", "_id time slotNumber date")
      .populate("turfId", "_id turfName mobileNumber email")
      .sort({ createdAt: -1 })
      .exec();
    const flatBookings = bookings.map((booking) => {
      const turf = booking.turfId as Turf | any;
      const slot = booking.slotId as Slot | any;
      return {
        _id: booking._id,
        turfId: turf?._id || "",
        price: booking.paid || 0,
        slotId: slot?._id?.toString() || "",
        status: booking.status || "",
        time: slot?.time || "",
        date: slot?.date || "",
        slotNumber: slot?.slotNumber || 0,
        turfName: turf?.turfName || "",
        mobileNumber: turf?.mobileNumber || "",
        email: turf?.email || "",
      };
    });
    return flatBookings;
  },
  async addLocation(
    id: string,
    locationName: string,
    latitude: number,
    longitude: number
  ): Promise<void> {
    const slots = await UserModel.updateOne(
      { _id: id },
      { locationName: locationName, latitude: latitude, longitude: longitude }
    );
    return;
  },
  async getUserDetails(id: string | null): Promise<any | null> {
    const user: User | null = await UserModel.findOne({ _id: id });
    return user ? user : null;
  },
  async cancellBooking(slotId: string, bookingId: string): Promise<any | null> {
    const slotObjectId = new mongoose.Types.ObjectId(slotId);
    const bookingObjectId = new mongoose.Types.ObjectId(bookingId);
    const booking = await BookingModel.findById(bookingObjectId).exec();
    const adjustedPaid = booking ? booking.paid * 0.6 : 0;
    await SlotModel.updateOne(
      { _id: slotObjectId },
      { $set: { isBooked: false }, $unset: { userId: "" } }
    );
    await BookingModel.updateOne(
      { _id: bookingObjectId },
      { $set: { status: "cancelled", paid: adjustedPaid } }
    );
  },
  async changePassword(
    id: string | null,
    password: string
  ): Promise<User | null> {
    await UserModel.updateOne({ _id: id }, { $set: { password: password } });
    return UserModel.findOne({ _id: id });
  },
  async updateRatings(review: Review): Promise<Review> {
    const ObjectId = mongoose.Types.ObjectId;
    const updatedReview = await ReviewModel.findOneAndUpdate(
      { turfId: review.turfId, userId: review.userId },
      review,
      { new: true, upsert: true }
    );
    const [ratingData] = await ReviewModel.aggregate([
      { $match: { turfId: new ObjectId(review.turfId) } },
      {
        $group: {
          _id: "$turfId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);
    const averageRating = ratingData?.averageRating || 0;
    const totalReviews = ratingData?.totalReviews || 0;
    await TurfModel.findOneAndUpdate(
      { _id: new ObjectId(review.turfId) },
      { rating: averageRating, votes: totalReviews },
      { new: true, upsert: true }
    );
    return updatedReview.toObject();
  },
  async getReviews(turfId: string): Promise<[Review[], number, number]> {
    const ObjectId = mongoose.Types.ObjectId;
    const reviews = await ReviewModel.find({ turfId })
      .populate("turfId", "turfName")
      .populate("userId", "firstName lastName")
      .exec();
    const [ratingData] = await ReviewModel.aggregate([
      { $match: { turfId: new ObjectId(turfId) } },
      {
        $group: {
          _id: "$turfId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);
    const averageRating = ratingData?.averageRating
      ? parseFloat(ratingData.averageRating.toFixed(2))
      : 0;
    const totalReviews = ratingData?.totalReviews || 0;
    return [reviews, averageRating, totalReviews];
  },
  async report(turfId: string, userId: string, issue: string): Promise<void> {
    const report = await ReportModel.findOneAndUpdate(
      { turfId, userId },
      { issue },
      { upsert: true, new: true }
    );
    return;
  },
  async userName(userId: string): Promise<string> {
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      return "";
    }
    console.log(user);
    const firstName = user.firstName ?? "";
    const lastName = user.lastName ?? "";
    return `${firstName} ${lastName}`;
  },
  async googleAuthentication(
    email: string,
    name: string,
    password: string
  ): Promise<any> {
    const user = await UserModel.findOne({ email });
    if (user) {
      return user.toObject();
    } else {
      try {
        const createdUser = await UserModel.create({
          email,
          firstName: name,
          password,
          isApproved: 1,
          isVerified: 1,
        });
        return createdUser.toObject();
      } catch (error) {
        console.log(error);
      }
    }
  },
  async createTeam(
    teamName: string,
    maxMembers: number,
    privacy: "pubic" | "private",
    userId: string
  ): Promise<Team> {
    const newTeam = new TeamModel({
      teamName,
      maxMembers,
      privacy,
      members: [{ userId, isAdmin: true }],
    });
    await newTeam.save();
    return newTeam.toObject() as Team;
  },
  async getTeams(): Promise<Team[]> {
    const teams = TeamModel.find();
    return teams;
  },
  async joinTeam(teamId: string, userId: string): Promise<Team[]> {
    await TeamModel.findByIdAndUpdate(
      teamId,
      {
        $push: { members: { userId, isAdmin: false } },
        $set: { updatedAt: new Date() },
      },
      { new: true, runValidators: true }
    );
    return await TeamModel.find();
  },
  async getTeam(id: string): Promise<Team | null> {
    const team = await TeamModel.findOne({ _id: id }).populate({
      path: "members.userId",
      select: "firstName lastName",
    });
    console.log(team?.members);
    return team;
  },
  async leftRemoveTeam(teamId: string, userId: string): Promise<Team | null> {
    let team = await TeamModel.findByIdAndUpdate(
      teamId,
      { $pull: { members: { userId: new mongoose.Types.ObjectId(userId) } } },
      { new: true }
    );
    if (team && team.members.length === 0) {
      team = await TeamModel.findByIdAndDelete(teamId);
    }
    return team;
  },
  async getSlotsForSell(id: string): Promise<any[]> {
    const bookings = await BookingModel.find()
      .populate("slotId", "_id time slotNumber date")
      .populate("turfId", "_id turfName mobileNumber email locationName latitude longitude")
      .populate("userId","_id firstName lastName mobileNumber")
      .sort({ createdAt: -1 })
      .exec();
    const flatBookings = bookings.map((booking) => {
      const turf = booking.turfId as Turf | any;
      const slot = booking.slotId as Slot | any;
      const user= booking.userId as User | any;
      return {
        _id: booking._id,
        turfId: turf?._id || "",
        price: booking.paid || 0,
        slotId: slot?._id?.toString() || "",
        status: booking.status || "",
        time: slot?.time || "",
        date: slot?.date || "",
        slotNumber: slot?.slotNumber || 0,
        turfName: turf?.turfName || "",
        mobileNumber: turf?.mobileNumber || "",
        email: turf?.email || "",
        latitude:turf?.latitude||0,
        longitude:turf?.longitude||0,
        location:turf?.locationName||"",
        userName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
        userMobileNumber: user?.mobileNumber || "",
      };
    });
    console.log(flatBookings)
    return flatBookings;
  },
  async sellSlot(teamId:string,userId:string,vacancy:number,slotId:string): Promise<Team | null>{
    const updatedTeam = await TeamModel.findOneAndUpdate(
      { _id: teamId },
      {
        $push: {
          slots: {
            slotId: new mongoose.Types.ObjectId(slotId),
            vacancy,
            members: [{ userId: new mongoose.Types.ObjectId(userId),isAdmin:true }]
          }
        }
      },
      { new: true, runValidators: true }
    );
    return updatedTeam
  },
  async joinSlot(teamId:string,slotId:string,userId:string): Promise<Team | null>{
    const updatedTeam = await TeamModel.findOneAndUpdate(
      { _id: teamId, "slots.slotId": slotId },
      {
        $push: { "slots.$.members": { userId: new mongoose.Types.ObjectId(userId) } },
        $inc: { "slots.$.vacancy": -1 }
      },
      { new: true, runValidators: true }
    );
    return updatedTeam;    
  }
};
