import { User } from "../entities/User";

export interface UserRepository{
  createUser(user: User): Promise<User>;
  findByEmail(email: string,): Promise<User | null>;
}