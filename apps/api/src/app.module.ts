import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { TsRestModule } from '@ts-rest/nest';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TsRestModule.register({
      isGlobal: true,
      jsonQuery: true,
      validateResponses: true,
    }),
    DatabaseModule,
    AuthModule,
  ],
})
export class AppModule { }
