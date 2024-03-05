import * as jwt from 'jsonwebtoken';

class TokenManager {
  static generateToken(payload: { id: number; role: string; email: string }): string {
    const secretKey = 'MKF';
    return jwt.sign(payload, secretKey, { expiresIn: '1h' });
  }
}

export default TokenManager;
