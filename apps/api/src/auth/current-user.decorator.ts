import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if (!request.user) {
      throw new Error('User not found in request');
    }
    const { sub: id, email } = request.user;
    return {
      id,
      email,
    };
  },
);

export type UserPayload = {
  id: string;
  email: string;
};
