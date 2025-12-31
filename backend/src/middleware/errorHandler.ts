import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../utils/types';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const errorResponse: ErrorResponse = {
    error: 'Internal server error',
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = err.message;
  }

  res.status(500).json(errorResponse);
};
