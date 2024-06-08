import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';

@InputType()
export class VFollowTempleInput {
  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  templeId: number;
}
