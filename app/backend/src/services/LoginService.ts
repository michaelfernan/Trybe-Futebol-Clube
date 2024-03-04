import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import User from '../database/models/User';

class LoginService {
  public static async authenticate(email: string, password: string): Promise<string | null> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, 'seu_secreto', {
      expiresIn: '1d',
    });

    return token;
  }
}

export default LoginService;
