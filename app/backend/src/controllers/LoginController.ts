import { Request, Response } from 'express';
import LoginService from '../services/LoginService';

class LoginController {
  private static invalidLoginMessage = 'Invalid email or password';

  private static isValidEmail(email: string): boolean {
    return /\S+@\S+\.\S+/.test(email);
  }

  public static async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields must be filled' });
    }

    if (!LoginController.isValidEmail(email)) {
      return res.status(401).json({ message: LoginController.invalidLoginMessage });
    }

    const token = await LoginService.authenticate(email, password);
    if (!token) {
      return res.status(401).json({ message: LoginController.invalidLoginMessage });
    }

    return res.status(200).json({ token });
  }
}

export default LoginController;
