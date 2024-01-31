import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional } from 'class-validator';

@InputType()
export class GetDeathAnniversariesInput {
  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  isEnd?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  isStart?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  isPending?: boolean;
}
