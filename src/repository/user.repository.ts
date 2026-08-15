import { BaseRepository } from "./base.repository";
import { IUser, User } from "../models/User";
import { IUserRepository } from "../interface/repository.interface/user.repository";

export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await this.model.findOne({ email }).exec();
  }

  async createUser(email: string, secretKey: string): Promise<IUser> {
    return await this.create({ email, secretKey });
  }

  async findBySecretKey(secretKey: string): Promise<IUser | null> {
    return await this.model.findOne({ secretKey }).exec();
  }
}
