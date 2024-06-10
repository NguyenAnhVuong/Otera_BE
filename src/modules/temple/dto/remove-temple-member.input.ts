import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';

@InputType()
export class VRemoveTempleMemberInput {
  @IsNumber()
  @Field(() => Int)
  @IsNotEmpty()
  userId: number;
}
