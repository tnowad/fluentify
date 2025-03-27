import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { apiContract } from '@fluentify/contracts';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  await app.listen(process.env.PORT ?? 3200, () => {
    logger.log(apiContract);
    logger.log(`API is running on port ${process.env.PORT ?? 3200}`);
  });
}
bootstrap();
