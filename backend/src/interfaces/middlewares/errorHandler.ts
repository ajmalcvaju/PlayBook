// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // If it's a known error with statusCode, return the status code and message
  if (err && err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  res.status(500).json({
    message: 'Something went wrong, please try again later.',
  });
};
