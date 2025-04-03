import {
  Controller,
  HttpStatus,
  NotImplementedException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TsRestException, tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { authContract } from '@workspace/contracts';
import { DatabaseService } from '../database/database.service';
import { compare, hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, UserPayload } from './current-user.decorator';

@Controller()
export class AuthController {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) { }

  @TsRestHandler(authContract)
  handler() {
    return tsRestHandler(authContract, {
      register: async ({ body }) => {
        const { name, email, password } = body;

        const isUserExists = await this.db
          .selectFrom('users')
          .select('id')
          .where('email', '=', email)
          .executeTakeFirst();

        if (isUserExists) {
          throw new TsRestException(authContract.register, {
            status: HttpStatus.CONFLICT,
            body: {
              error: 'Conflict',
              message: 'Email already in use',
            },
          });
        }

        const hashedPassword = await hash(password, 10);

        const user = await this.db
          .insertInto('users')
          .values({
            name,
            email,
            hashed_password: hashedPassword,
          })
          .returning(['id', 'email', 'name'])
          .executeTakeFirstOrThrow();

        const tokens = this.generateTokens({ sub: user.id, email });

        return {
          status: HttpStatus.CREATED,
          body: {
            user: user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          },
        };
      },

      login: async ({ body }) => {
        const { email, password } = body;

        const user = await this.db
          .selectFrom('users')
          .select(['id', 'email', 'name', 'hashed_password'])
          .where('email', '=', email)
          .executeTakeFirst();

        if (!user) {
          throw new TsRestException(authContract.login, {
            status: HttpStatus.UNAUTHORIZED,
            body: {
              error: 'Unauthorized',
              message: 'Invalid credentials',
            },
          });
        }

        const isPasswordValid = await compare(password, user.hashed_password);
        if (!isPasswordValid) {
          throw new TsRestException(authContract.login, {
            status: HttpStatus.UNAUTHORIZED,
            body: {
              error: 'Unauthorized',
              message: 'Invalid credentials',
            },
          });
        }

        const tokens = this.generateTokens({ sub: user.id, email });

        return {
          status: HttpStatus.OK,
          body: {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          },
        };
      },
      me: async () => {
        throw new NotImplementedException();
      },
      forgotPassword: () => {
        throw new NotImplementedException();
      },
      logout: () => {
        throw new NotImplementedException();
      },
      refresh: async ({ body }) => {
        const { refreshToken } = body;

        try {
          const payload = this.jwtService.verify(refreshToken);

          if (payload.tokenType !== 'refresh') {
            throw new TsRestException(authContract.refresh, {
              status: HttpStatus.UNAUTHORIZED,
              body: {
                error: 'Unauthorized',
                message: 'Invalid token type',
              },
            });
          }

          const user = await this.db
            .selectFrom('users')
            .select(['id', 'email'])
            .where('id', '=', payload.sub)
            .executeTakeFirst();

          if (!user) {
            throw new TsRestException(authContract.refresh, {
              status: HttpStatus.UNAUTHORIZED,
              body: {
                error: 'Unauthorized',
                message: 'User not found',
              },
            });
          }

          const tokens = this.generateTokens({
            sub: user.id,
            email: user.email,
          });

          return {
            status: HttpStatus.OK,
            body: {
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
            },
          };
        } catch (err) {
          throw new TsRestException(authContract.refresh, {
            status: HttpStatus.UNAUTHORIZED,
            body: {
              error: 'Unauthorized',
              message: 'Invalid or expired refresh token',
            },
          });
        }
      },
      resetPassword: () => {
        throw new NotImplementedException();
      },
      verifyEmail: () => {
        throw new NotImplementedException();
      },
    });
  }

  @TsRestHandler(authContract.me)
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() userPayload: UserPayload) {
    return tsRestHandler(authContract.me, async () => {
      const user = await this.db
        .selectFrom('users')
        .select(['id', 'name', 'email'])
        .where('id', '=', userPayload.id)
        .executeTakeFirstOrThrow();

      return {
        status: HttpStatus.OK,
        body: user,
      };
    });
  }

  generateTokens(payload: { sub: string; email: string }) {
    const accessToken = this.jwtService.sign(
      { ...payload, tokenType: 'access' },
      { expiresIn: '15m' },
    );

    const refreshToken = this.jwtService.sign(
      { ...payload, tokenType: 'refresh' },
      { expiresIn: '7d' },
    );

    return { accessToken, refreshToken };
  }
}
