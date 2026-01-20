import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  status: number;
  code: string;
  context?: any;
  constructor(status: number, code: string, message: string, context?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.context = context;
  }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(err);
  if (err instanceof AppError) {
    return res.status(err.status).json({ code: err.code, message: err.message, context: err.context || {} });
  }
  return res.status(500).json({ code: 'internal_error', message: 'Unexpected error', context: {} });
};
