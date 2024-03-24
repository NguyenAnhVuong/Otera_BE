import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';

@InputType()
export class VBookingEventInput {
  @IsNumber()
  @IsNotEmpty()
  @Field(() => Int)
  eventId: number;
}
