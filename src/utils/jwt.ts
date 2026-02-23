import jwt from 'jsonwebtoken';
import { appConfig } from '../config/app';

interface TokenPayload {
  userId: string;
  email: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, appConfig.jwt.secret, {
    expiresIn: appConfig.jwt.expiresIn as string | number,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, appConfig.jwt.secret) as TokenPayload;
}
