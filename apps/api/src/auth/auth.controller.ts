import {
  Controller,
  HttpStatus,
  NotImplementedException,
} from '@nestjs/common';
import { TsRestException, tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { authContract } from '@workspace/contracts';
import { DatabaseService } from '../database/database.service';
import { hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

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

      login: () => {
        throw new NotImplementedException();
      },
      me: () => {
        throw new NotImplementedException();
      },
      forgotPassword: () => {
        throw new NotImplementedException();
      },
      logout: () => {
        throw new NotImplementedException();
      },
      refresh: () => {
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
