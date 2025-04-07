import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TsRestModule } from '@ts-rest/nest';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { WordsModule } from './words/words.module';
import { TopicsModule } from './topics/topics.module';
import { FlashcardsModule } from './flashcards/flashcards.module';
import { GeminiModule } from './gemini/gemini.module';
import { EbisuModule } from './ebisu/ebisu.module';
import { QdrantModule } from './qdrant/qdrant.module';
import { ClickhouseModule } from './clickhouse/clickhouse.module';

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
    WordsModule,
    TopicsModule,
    FlashcardsModule,
    GeminiModule,
    EbisuModule,
    QdrantModule,
    ClickhouseModule,
  ],
})
export class AppModule {}
