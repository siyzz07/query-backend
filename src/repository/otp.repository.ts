import { BaseRepository } from './base.repository';
import { IOtp } from '../models/Otp';
import { IOtpRepository } from '../interface/repository.interface/otp.repository';
import { Model } from 'mongoose';

export class OtpRepository extends BaseRepository<IOtp> implements IOtpRepository {
  constructor(model: Model<IOtp>) {
    super(model);
  }

  async createOtp(email: string, otp: string): Promise<IOtp> {
    return this.create({ email, otp });
  }

  async findByEmailAndOtp(email: string, otp: string): Promise<IOtp | null> {
    return this.findOne({ email, otp });
  }

  async deleteOtp(email: string, otp: string): Promise<void> {
    await this.model.deleteOne({ email, otp });
  }

  async deleteOtpByEmail(email: string): Promise<void> {
    await this.model.deleteMany({ email });
  }
}
