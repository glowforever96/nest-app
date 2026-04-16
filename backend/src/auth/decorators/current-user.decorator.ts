import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { JwtValidatedUser } from '../strategies/jwt.strategy.js';

type RequestWithUser = { user?: JwtValidatedUser };

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtValidatedUser => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  },
);
