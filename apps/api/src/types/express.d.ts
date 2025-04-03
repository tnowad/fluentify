import 'express';

declare module 'express' {
  interface Request {
    user?: {
      sub: string;
      email: string;
      tokenType: 'access' | 'refresh';
      iat: number;
      exp: number;
    };
  }
}
