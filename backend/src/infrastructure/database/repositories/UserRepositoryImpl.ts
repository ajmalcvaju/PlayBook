import { User } from "../../../domain/entities/User";
import { UserRepository } from "../../../domain/repositories/UserRepository";
import { UserModel, UserDocument } from "../models/userModel";

export const UserRepositoryImpl: UserRepository = {
  async createUser(user: User): Promise<User> {
    const createdUser = await UserModel.create(user);
    return createdUser.toObject();
  },
  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    return user ? user.toObject() : null;
  },
};
