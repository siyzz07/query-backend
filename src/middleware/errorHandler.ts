import { Request, Response, NextFunction } from 'express';
import { STATUS_CODES } from '../constants/status';

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('[Global Error Log]:', err);

  const statusCode = err.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal server error.';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}
