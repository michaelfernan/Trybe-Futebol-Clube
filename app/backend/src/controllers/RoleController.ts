import { Request, Response } from 'express';
import User from '../database/models/User';

class RoleController {
  public static async getRole(req: Request, res: Response): Promise<Response> {
    const { user } = res.locals;
    const foundUser = await User.findByPk(user.id);
    if (!foundUser) {
      return res.status(401).json({ message: 'User not found' });
    }
    return res.status(200).json({ role: foundUser.role });
  }
}

export default RoleController;
