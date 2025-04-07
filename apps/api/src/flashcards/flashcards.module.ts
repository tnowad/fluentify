import { Module } from '@nestjs/common';
import { FlashcardsController } from './flashcards.controller';
import { QdrantModule } from '../qdrant/qdrant.module';
import { ClickhouseModule } from '../clickhouse/clickhouse.module';
import { EbisuModule } from '../ebisu/ebisu.module';

@Module({
  imports: [QdrantModule, ClickhouseModule, EbisuModule],
  controllers: [FlashcardsController]
})
export class FlashcardsModule { }
