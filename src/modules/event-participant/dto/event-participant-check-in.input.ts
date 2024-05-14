import { EVENT_PARTICIPANT_CODE_LENGTH } from '@core/constants';
import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';

@InputType()
export class VEventParticipantCheckInInput {
  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  eventId: number;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @Length(EVENT_PARTICIPANT_CODE_LENGTH, EVENT_PARTICIPANT_CODE_LENGTH)
  code: string;
}
