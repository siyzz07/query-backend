import { IUser } from '../../models/User';

export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    secretKey: string;
    apiKey?: string;
    botName?: string;
    botRole?: string;
    companyName?: string;
    primaryGoal?: string;
    toneOfVoice?: string;
    allowedTopics?: string;
    forbiddenTopics?: string;
    fallbackMessage?: string;
    maxLengthSentences?: number;
    preferredLanguage?: string;
  };
  cookieOptions: {
    accessToken: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: 'lax' | 'strict' | 'none';
      maxAge: number;
    };
    refreshToken: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: 'lax' | 'strict' | 'none';
      maxAge: number;
    };
  };
}

export interface ILogoutResponse {
  cookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'lax' | 'strict' | 'none';
  };
}

export interface IMeResponse {
  user: {
    id: string;
    email: string;
    secretKey: string;
    apiKey?: string;
    botName?: string;
    botRole?: string;
    companyName?: string;
    primaryGoal?: string;
    toneOfVoice?: string;
    allowedTopics?: string;
    forbiddenTopics?: string;
    fallbackMessage?: string;
    maxLengthSentences?: number;
    preferredLanguage?: string;
  };
  newAccessToken?: string;
  cookieOptions?: {
    accessToken: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: 'lax' | 'strict' | 'none';
      maxAge: number;
    };
  };
}

export interface IAuthService {
  login(email: string): Promise<{ message: string }>;
  verifyOtp(email: string, otp: string): Promise<ILoginResponse>;
  resendOtp(email: string): Promise<{ message: string }>;
  logout(): Promise<ILogoutResponse>;
  me(accessToken?: string, refreshToken?: string): Promise<IMeResponse>;
  refresh(refreshToken: string): Promise<{ accessToken: string; cookieOptions: any }>;
  updateApiKey(email: string, apiKey: string): Promise<void>;
  updatePromptSettings(email: string, settings: Partial<IUser>): Promise<IUser>;
}
