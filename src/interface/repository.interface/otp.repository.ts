import { IBaseRepository } from './base.repository';
import { IOtp } from '../../models/Otp';

export interface IOtpRepository extends IBaseRepository<IOtp> {
  createOtp(email: string, otp: string): Promise<IOtp>;
  findByEmailAndOtp(email: string, otp: string): Promise<IOtp | null>;
  deleteOtp(email: string, otp: string): Promise<void>;
  deleteOtpByEmail(email: string): Promise<void>;
}
