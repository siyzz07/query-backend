import { AuthController } from "../controller/authController";
import { AuthService } from "../services/auth/auth.service";
import { userRepository, otpRepository } from "./repository.di";

const authService = new AuthService(userRepository, otpRepository);
export const authController = new AuthController(authService);
