import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

export default class RoleController {
  public static getRole(req: Request, res: Response): Response {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: 'Token not found' });
    }
    const decoded = jwt.decode(token) as unknown as { id: number; role: string; email: string };
    return res.status(200).json({ role: decoded.role });
  }
}
