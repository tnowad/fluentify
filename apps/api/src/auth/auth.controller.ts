import {
  Controller,
  HttpStatus,
  Logger,
  NotImplementedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TsRestException, tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { authContract } from '@workspace/contracts';
import { compare, hash } from 'bcryptjs';
import { DatabaseService } from '../database/database.service';
import { CurrentUser, UserPayload } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { uuidv7 } from 'uuidv7';
import { sql } from 'kysely';

type JwtPayload = {
  sub: string;
  email: string;
  tokenType: 'access' | 'refresh';
};

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  @TsRestHandler(authContract)
  handler() {
    return tsRestHandler(authContract, {
      register: async ({ body }) => {
        const { name, email } = body;
        this.logger.log(`Register attempt: ${email}`);

        const isUserExists = await this.db
          .selectFrom('users')
          .select('id')
          .where('email', '=', email)
          .executeTakeFirst();

        if (isUserExists) {
          this.logger.warn(`Register failed - Email in use: ${email}`);
          throw new TsRestException(authContract.register, {
            status: HttpStatus.CONFLICT,
            body: {
              error: 'Conflict',
              message: 'Email already in use',
            },
          });
        }

        const hashedPassword = await hash(body.password, 10);
        const user = await this.db
          .insertInto('users')
          .values({
            id: uuidv7(),
            name,
            email,
            hashed_password: hashedPassword,
            created_at: sql`now()`,
          })
          .returning(['id', 'email', 'name'])
          .executeTakeFirstOrThrow();

        this.logger.log(`User registered: ${email} (ID: ${user.id})`);
        const tokens = this.generateTokens({ sub: user.id, email });

        return {
          status: HttpStatus.CREATED,
          body: {
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          },
        };
      },

      login: async ({ body }) => {
        const { email } = body;
        this.logger.log(`Login attempt: ${email}`);

        const user = await this.db
          .selectFrom('users')
          .select(['id', 'email', 'name', 'hashed_password'])
          .where('email', '=', email)
          .executeTakeFirst();

        if (!user) {
          this.logger.warn(`Login failed - User not found: ${email}`);
          throw new TsRestException(authContract.login, {
            status: HttpStatus.UNAUTHORIZED,
            body: {
              error: 'Unauthorized',
              message: 'Invalid credentials',
            },
          });
        }

        const isPasswordValid = await compare(
          body.password,
          user.hashed_password,
        );
        if (!isPasswordValid) {
          this.logger.warn(`Login failed - Invalid password: ${email}`);
          throw new TsRestException(authContract.login, {
            status: HttpStatus.UNAUTHORIZED,
            body: {
              error: 'Unauthorized',
              message: 'Invalid credentials',
            },
          });
        }

        this.logger.log(`Login successful: ${email} (ID: ${user.id})`);
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

      refresh: async ({ body }) => {
        this.logger.log(`Refresh token attempt`);

        try {
          const payload = this.jwtService.verify<JwtPayload>(body.refreshToken);

          if (payload.tokenType !== 'refresh') {
            this.logger.warn(`Invalid token type in refresh`);
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
            this.logger.warn(`Refresh failed - User not found`);
            throw new TsRestException(authContract.refresh, {
              status: HttpStatus.UNAUTHORIZED,
              body: {
                error: 'Unauthorized',
                message: 'User not found',
              },
            });
          }

          this.logger.log(`Token refreshed for user: ${user.email}`);
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
        } catch (err: any) {
          this.logger.warn(`Refresh token error: ${err}`);
          throw new TsRestException(authContract.refresh, {
            status: HttpStatus.UNAUTHORIZED,
            body: {
              error: 'Unauthorized',
              message: 'Invalid or expired refresh token',
            },
          });
        }
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

      this.logger.log(`Fetched current user info: ${user.email}`);
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
