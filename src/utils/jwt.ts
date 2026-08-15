import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_query_key_2026';
const REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET || 'super_secret_refresh_key_2026';

export const generateAccessToken = (payload: object, expiresIn: any = '1h'): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyAccessToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};

export const generateRefreshToken = (payload: object, expiresIn: any = '7d'): string => {
  return jwt.sign(payload, REFRESH_JWT_SECRET, { expiresIn });
};

export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, REFRESH_JWT_SECRET);
};
