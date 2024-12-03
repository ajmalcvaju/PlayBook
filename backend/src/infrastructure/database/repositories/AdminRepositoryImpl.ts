import { AdminRepository } from "../../../domain/repositories/AdminRepository";
import { UserModel } from "../models/userModel";
import { User } from "../../../domain/entities/User";
import { Turf } from '../../../domain/entities/Turf';
import { TurfModel } from "../models/turfModel";

export const AdminRepositoryImpl: AdminRepository= {
  async findUsers(): Promise<User[] | null> {
    const users = await UserModel.find();
    return users
},
async findTurfs(): Promise<Turf[] | null> {
    const turfs = await TurfModel.find();
    return turfs
}
}
