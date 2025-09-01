import { Module } from '@nestjs/common';
import { RoundsService } from './rounds.service';
import { RoundsController } from './rounds.controller';
import { RoundsScheduler } from './rounds.scheduler.js';

@Module({
  providers: [RoundsService, RoundsScheduler],
  controllers: [RoundsController],
})
export class RoundsModule {}


