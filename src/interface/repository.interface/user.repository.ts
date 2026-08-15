import { IBaseRepository } from "./base.repository";
import { IUser } from "../../models/User";

export interface IUserRepository extends IBaseRepository<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  createUser(email: string, secretKey: string): Promise<IUser>;
  findBySecretKey(secretKey: string): Promise<IUser | null>;
}
