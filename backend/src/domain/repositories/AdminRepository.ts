import { Turf } from "../entities/Turf";
import { User } from "../entities/User";

export interface AdminRepository{
  findUsers(): Promise<User[]|null>,
  findTurfs(): Promise<Turf[] | null>
}