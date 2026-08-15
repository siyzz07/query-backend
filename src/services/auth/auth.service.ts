import { IAuthService, ILoginResponse, ILogoutResponse, IMeResponse } from '../../interface/service.interface/auth';
import { IUserRepository } from '../../interface/repository.interface/user.repository';
import { IOtpRepository } from '../../interface/repository.interface/otp.repository';
import { AppError } from '../../middleware/errorHandler';
import { IUser } from '../../models/User';
import { STATUS_CODES } from '../../constants/status';
import { MESSAGES } from '../../constants/messages';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../../utils/jwt';
import { generateOtp } from '../../utils/otp';
import { sendMail } from '../../lib/nodemailer';
import { EMAIL_TEMPLATES } from '../../constants/emailTemplates';
import { emailQueue } from '../../lib/queue';

export class AuthService implements IAuthService {
  private userRepository: IUserRepository;
  private otpRepository: IOtpRepository;

  constructor(userRepository: IUserRepository, otpRepository: IOtpRepository) {
    this.userRepository = userRepository;
    this.otpRepository = otpRepository;
  }

  private mapUserResponse = (user: any) => {
    return {
      id: user._id ? user._id.toString() : '',
      email: user.email,
      secretKey: user.secretKey,
      apiKey: user.apiKey,
      botName: user.botName,
      botRole: user.botRole,
      companyName: user.companyName,
      primaryGoal: user.primaryGoal,
      toneOfVoice: user.toneOfVoice,
      allowedTopics: user.allowedTopics,
      forbiddenTopics: user.forbiddenTopics,
      fallbackMessage: user.fallbackMessage,
      maxLengthSentences: user.maxLengthSentences,
      preferredLanguage: user.preferredLanguage
    };
  };

    async login(email: string): Promise<{ message: string }> {
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        throw new AppError(MESSAGES.AUTH.INVALID_CREDENTIALS, STATUS_CODES.BAD_REQUEST);
      }

      await this.otpRepository.deleteOtpByEmail(email);

      const otp = generateOtp();
      await this.otpRepository.createOtp(email, otp);

      try {
        await emailQueue.add('send-otp', {
          to: email,
          subject: EMAIL_TEMPLATES.OTP.SUBJECT,
          html: EMAIL_TEMPLATES.OTP.HTML(otp)
        }, {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000
          }
        });
      } catch (queueError) {
        console.error('Failed to queue OTP email, sending synchronously:', queueError);
        try {
          await sendMail(
            email,
            EMAIL_TEMPLATES.OTP.SUBJECT,
            EMAIL_TEMPLATES.OTP.HTML(otp)
          );
        } catch (mailError) {
          console.error('Failed to send verification email synchronously:', mailError);
        }
      }

      return { message: MESSAGES.AUTH.OTP_SENT_SUCCESS };
    }

  async resendOtp(email: string): Promise<{ message: string }> {
    return this.login(email);
  }

  async verifyOtp(email: string, otp: string): Promise<ILoginResponse> {
    const otpRecord = await this.otpRepository.findByEmailAndOtp(email, otp);

    if (!otpRecord) {
      throw new AppError(MESSAGES.AUTH.OTP_INVALID, STATUS_CODES.BAD_REQUEST);
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError(MESSAGES.AUTH.INVALID_CREDENTIALS, STATUS_CODES.BAD_REQUEST);
    }

    await this.otpRepository.deleteOtp(email, otp);


    const userIdStr = (user as any)._id ? (user as any)._id.toString() : '';

    const accessToken = generateAccessToken({ id: userIdStr, email: user.email,secretKey:user.secretKey});
    const refreshToken = generateRefreshToken({ id: userIdStr, email: user.email,secretKey:user.secretKey});

    const cookieOptions = {
      accessToken: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 15 * 60 * 1000 // 15 minutes
      },
      refreshToken: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      }
    };

    return {
      accessToken,
      refreshToken,
      user: this.mapUserResponse(user),
      cookieOptions
    };
  }

  async logout(): Promise<ILogoutResponse> {
    return {
      cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const
      }
    };
  }

  async me(accessToken?: string, refreshToken?: string): Promise<IMeResponse> {
    let payload: any = null;

    if (accessToken) {
      try {
        payload = verifyAccessToken(accessToken);
      } catch (err: any) {
        if (err.name !== 'TokenExpiredError') {
          throw new AppError(MESSAGES.AUTH.TOKEN_INVALID, STATUS_CODES.UNAUTHORIZED);
        }
      }
    }

    if (payload) {
      const user = await this.userRepository.findByEmail(payload.email);
      if (!user) {
        throw new AppError(MESSAGES.AUTH.TOKEN_INVALID, STATUS_CODES.UNAUTHORIZED);
      }
      return {
        user: this.mapUserResponse(user)
      };
    }

    if (refreshToken) {
      try {
        const refreshPayload = verifyRefreshToken(refreshToken);
        const user = await this.userRepository.findByEmail(refreshPayload.email);
        if (!user) {
          throw new AppError(MESSAGES.AUTH.TOKEN_INVALID, STATUS_CODES.UNAUTHORIZED);
        }

        const userIdStr = (user as any)._id ? (user as any)._id.toString() : '';
        const newAccessToken = generateAccessToken({ id: userIdStr, email: user.email, secretKey: user.secretKey });

        const cookieOptions = {
          accessToken: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            maxAge: 15 * 60 * 1000 // 15 minutes
          }
        };

        return {
          user: this.mapUserResponse(user),
          newAccessToken,
          cookieOptions
        };
      } catch (refreshErr) {
        throw new AppError(MESSAGES.AUTH.TOKEN_INVALID, STATUS_CODES.UNAUTHORIZED);
      }
    }

    throw new AppError(MESSAGES.AUTH.TOKEN_INVALID, STATUS_CODES.UNAUTHORIZED);
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; cookieOptions: any }> {
    try {
      const refreshPayload = verifyRefreshToken(refreshToken);
      const user = await this.userRepository.findByEmail(refreshPayload.email);
      if (!user) {
        throw new AppError(MESSAGES.AUTH.TOKEN_INVALID, STATUS_CODES.UNAUTHORIZED);
      }

      const userIdStr = (user as any)._id ? (user as any)._id.toString() : '';
      const accessToken = generateAccessToken({ id: userIdStr, email: user.email, secretKey: user.secretKey });

      const cookieOptions = {
        accessToken: {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax' as const,
          maxAge: 15 * 60 * 1000 // 15 minutes
        }
      };

      return { accessToken, cookieOptions };
    } catch (err) {
      throw new AppError(MESSAGES.AUTH.TOKEN_INVALID, STATUS_CODES.UNAUTHORIZED);
    }
  }

  async updateApiKey(email: string, apiKey: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError(MESSAGES.AUTH.INVALID_CREDENTIALS, STATUS_CODES.NOT_FOUND);
    }
    user.apiKey = apiKey;
    await (user as any).save();
  }

  async updatePromptSettings(email: string, settings: Partial<IUser>): Promise<IUser> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError(MESSAGES.AUTH.INVALID_CREDENTIALS, STATUS_CODES.NOT_FOUND);
    }

    if (settings.botName !== undefined) user.botName = settings.botName;
    if (settings.botRole !== undefined) user.botRole = settings.botRole;
    if (settings.companyName !== undefined) user.companyName = settings.companyName;
    if (settings.primaryGoal !== undefined) user.primaryGoal = settings.primaryGoal;
    if (settings.toneOfVoice !== undefined) user.toneOfVoice = settings.toneOfVoice;
    if (settings.allowedTopics !== undefined) user.allowedTopics = settings.allowedTopics;
    if (settings.forbiddenTopics !== undefined) user.forbiddenTopics = settings.forbiddenTopics;
    if (settings.fallbackMessage !== undefined) user.fallbackMessage = settings.fallbackMessage;
    if (settings.maxLengthSentences !== undefined) user.maxLengthSentences = settings.maxLengthSentences;
    if (settings.preferredLanguage !== undefined) user.preferredLanguage = settings.preferredLanguage;

    await (user as any).save();
    return user;
  }
}
