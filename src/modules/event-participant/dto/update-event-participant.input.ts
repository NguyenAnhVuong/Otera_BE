import { EBookingStatus } from '@core/enum';
import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

@InputType()
export class UpdateEventParticipantInput {
  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  eventParticipantId!: number;

  @Field(() => EBookingStatus)
  @IsEnum(EBookingStatus)
  bookingStatus!: EBookingStatus;

  @Field(() => String, { nullable: true })
  rejectReason?: string;
}
