import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsNumber, IsOptional } from 'class-validator';

@ArgsType()
export class PaginationQuery {
  @IsNumber()
  @IsOptional()
  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  take?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  skip?: number;
}
