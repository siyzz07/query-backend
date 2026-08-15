import { UserRepository } from "../repository/user.repository";
import { OtpRepository } from "../repository/otp.repository";
import { Otp } from "../models/Otp";
import { DocumentRepository } from "../repository/document.repository";
import { DocumentChunkRepository } from "../repository/documentChunk.repository";

export const userRepository  = new UserRepository();
export const otpRepository = new OtpRepository(Otp);
export const documentRepository = new DocumentRepository();
export const documentChunkRepository = new DocumentChunkRepository();