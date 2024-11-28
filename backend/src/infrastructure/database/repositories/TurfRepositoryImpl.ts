import { Turf } from "../../../domain/entities/Turf";
import { TurfRepository } from "../../../domain/repositories/TurfRepository";
import { TurfModel,TurfDocument } from "../models/turfModel";
import { TurfDetails } from "../../../domain/entities/Turf";

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
  }
};
