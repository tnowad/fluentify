import {
  Controller,
  HttpStatus,
  NotImplementedException,
} from '@nestjs/common';
import { TsRestException, tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { authContract } from '@workspace/contracts';
import { DatabaseService } from '../database/database.service';
import { hash } from 'bcryptjs';

@Controller()
export class AuthController {
  constructor(private readonly db: DatabaseService) { }

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

        return {
          status: HttpStatus.CREATED,
          body: {
            user: user,
            accessToken: '', // TODO: attach JWT
            refreshToken: '', // TODO: attach Refresh Token
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
}
