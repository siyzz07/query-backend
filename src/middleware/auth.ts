import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];

  if (!token && req.headers.cookie) {
    const cookies = Object.fromEntries(
      req.headers.cookie.split(';').map(cookie => {
        const [key, value] = cookie.trim().split('=');
        return [key, value];
      })
    );
    token = cookies['accessToken'];
  }

  if (!token) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  try {
    const user = verifyAccessToken(token);
    req.user = user as AuthenticatedRequest['user'];
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(role: 'admin' | 'customer') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: `Forbidden: requires ${role} privileges` });
    }
    next();
  };
}
