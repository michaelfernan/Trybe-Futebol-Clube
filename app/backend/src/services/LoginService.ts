// LoginService.ts

import * as bcrypt from 'bcryptjs';
import User from '../database/models/User';
import TokenManager from '../utils/TokenManager';

class LoginService {
  public static async authenticate(email: string, password: string): Promise<User | null> {
    const user = await User.findOne({ where: { email } });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return null;
    }
    return user;
  }

  public static generateToken(user: User): string {
    const payload = { id: user.id, role: user.role, email: user.email };
    return TokenManager.generateToken(payload);
  }
}

export default LoginService;
