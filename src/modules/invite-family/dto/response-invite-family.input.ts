import { EStatus } from '@core/enum';
import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsNumber } from 'class-validator';

@InputType()
export class ResponseInviteFamilyInput {
  @IsNumber()
  @Field(() => Int)
  id: number;

  @IsNumber()
  @Field(() => Int)
  notificationId: number;

  @IsEnum(EStatus)
  @Field(() => EStatus)
  status: EStatus;
}
