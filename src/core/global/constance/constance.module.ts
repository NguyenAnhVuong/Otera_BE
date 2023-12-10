import { Module, Global } from '@nestjs/common';
import { ConstanceService } from './constance.service';

@Global()
@Module({
  providers: [ConstanceService],
  exports: [ConstanceService],
})
export class ConstanceModule {}
