import { GQLPaginationArgs } from '@core/global/entities/paginationQuery.entity';
import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';

@ArgsType()
export class GetFamilyArgs extends GQLPaginationArgs {
  @Field(() => Int)
  @IsNumber()
  id: number;
}
