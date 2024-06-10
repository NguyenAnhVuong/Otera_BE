import { EStatus } from '@core/enum';
import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class VUpdateStatusTempleInput {
  @Field(() => Int)
  @IsNumber()
  @IsOptional()
  id: number;

  @Field(() => EStatus)
  @IsEnum(EStatus)
  @IsIn([EStatus.APPROVED, EStatus.REJECTED, EStatus.BLOCKED])
  status: EStatus;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  rejectReason?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  blockReason?: string;
}
