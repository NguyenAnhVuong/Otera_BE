import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ScheduleService } from './schedule.service';

@Global()
@Module({
  providers: [ScheduleService],
  exports: [ScheduleService],
  imports: [ScheduleModule.forRoot()],
})
export class CronjobModule {}
