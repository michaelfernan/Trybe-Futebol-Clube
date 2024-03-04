import { Request, Response } from 'express';
import LoginService from '../services/LoginService';

class LoginController {
  public static async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields must be filled' });
    }

    const token = await LoginService.authenticate(email, password);
    if (!token) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.status(200).json({ token });
  }
}

export default LoginController;
