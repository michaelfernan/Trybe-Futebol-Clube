import { Request, Response } from 'express';
import LoginService from '../services/LoginService';

class LoginController {
  public static async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    const user = await LoginService.authenticate(email, password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = LoginService.generateToken(user);
    return res.status(200).json({ token });
  }
}

export default LoginController;
