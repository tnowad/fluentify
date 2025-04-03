import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TsRestModule } from '@ts-rest/nest';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';

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
export class AppModule {}
