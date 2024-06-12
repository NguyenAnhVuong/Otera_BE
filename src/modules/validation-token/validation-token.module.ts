import { Module } from '@nestjs/common';
import { ValidationTokenService } from './validation-token.service';
import { ValidationTokenResolver } from './validation-token.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidationToken } from '@core/database/entity/validationToken.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ValidationToken])],
  providers: [ValidationTokenResolver, ValidationTokenService],
  exports: [ValidationTokenService],
})
export class ValidationTokenModule {}
