import { Request, Response, NextFunction } from 'express';
import { IAuthService } from '../interface/service.interface/auth';
import { STATUS_CODES } from '../constants/status';

export class AuthController {
  private authService: IAuthService;

  constructor(authService: IAuthService) {
    this.authService = authService;
  }

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ error: 'Email is required' });
        return;
      }

      const result = await this.authService.login(email);
      res.status(STATUS_CODES.OK).json(result);
    } catch (err: any) {
      next(err);
    }
  };

  verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ error: 'Email and OTP are required' });
        return;
      }

      const { accessToken, refreshToken, user, cookieOptions } = await this.authService.verifyOtp(email, otp);

      // Set cookies
      res.cookie('accessToken', accessToken, cookieOptions.accessToken);
      res.cookie('refreshToken', refreshToken, cookieOptions.refreshToken);

      res.status(STATUS_CODES.OK).json({ user });
    } catch (err: any) {
      next(err);
    }
  };

  resendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ error: 'Email is required' });
        return;
      }

      const result = await this.authService.resendOtp(email);
      res.status(STATUS_CODES.OK).json(result);
    } catch (err: any) {
      next(err);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { cookieOptions } = await this.authService.logout();
      res.clearCookie('accessToken', cookieOptions);
      res.clearCookie('refreshToken', cookieOptions);
      res.status(STATUS_CODES.OK).json({ message: 'Logged out successfully' });
    } catch (err: any) {
      next(err);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cookieHeader = req.headers.cookie;
      const cookies = cookieHeader ? Object.fromEntries(
        cookieHeader.split(';').map(cookie => {
          const [key, value] = cookie.trim().split('=');
          return [key, value];
        })
      ) : {};

      const accessToken = cookies['accessToken'];
      const refreshToken = cookies['refreshToken'];

      const { user, newAccessToken, cookieOptions } = await this.authService.me(accessToken, refreshToken);

      if (newAccessToken && cookieOptions) {
        res.cookie('accessToken', newAccessToken, cookieOptions.accessToken);
      }

      res.status(STATUS_CODES.OK).json({ user });
    } catch (err: any) {
      next(err);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cookieHeader = req.headers.cookie;
      const cookies = cookieHeader ? Object.fromEntries(
        cookieHeader.split(';').map(cookie => {
          const [key, value] = cookie.trim().split('=');
          return [key, value];
        })
      ) : {};

      const refreshToken = cookies['refreshToken'];
      if (!refreshToken) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({ error: 'Refresh token missing' });
        return;
      }

      const { accessToken, cookieOptions } = await this.authService.refresh(refreshToken);
      res.cookie('accessToken', accessToken, cookieOptions.accessToken);
      res.status(STATUS_CODES.OK).json({ success: true });
    } catch (err: any) {
      next(err);
    }
  };

  updateApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = (req as any).user;
      if (!authUser || !authUser.email) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({ error: 'Unauthorized' });
        return;
      }
      
      const { apiKey } = req.body;
      if (apiKey === undefined) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ error: 'API key is required' });
        return;
      }

      await this.authService.updateApiKey(authUser.email, apiKey);
      res.status(STATUS_CODES.OK).json({ message: 'API key updated successfully' });
    } catch (err: any) {
      next(err);
    }
  };

  updatePromptSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = (req as any).user;
      if (!authUser || !authUser.email) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({ error: 'Unauthorized' });
        return;
      }

      const settings = req.body;
      const updatedUser = await this.authService.updatePromptSettings(authUser.email, settings);
      res.status(STATUS_CODES.OK).json({ message: 'Prompt settings updated successfully', user: updatedUser });
    } catch (err: any) {
      next(err);
    }
  };
}
