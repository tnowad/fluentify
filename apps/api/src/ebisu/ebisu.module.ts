import { Module } from '@nestjs/common';
import { EbisuService } from './ebisu.service';

@Module({
  providers: [EbisuService],
  exports: [EbisuService],
})
export class EbisuModule {}
