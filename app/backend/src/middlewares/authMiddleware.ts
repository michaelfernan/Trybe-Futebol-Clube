import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Token not found' });
  }
  const parts = authHeader.split(' ');

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ message: 'Token must be a valid token' });
  }

  jwt.verify(token, 'MKF', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token must be a valid token' });
    }
    res.locals.user = decoded;
    next();
  });
};

export default authMiddleware;
