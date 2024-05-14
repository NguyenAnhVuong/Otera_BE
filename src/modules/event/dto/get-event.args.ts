import { PaginationQuery } from '@core/global/entities/paginationQuery.entity';
import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsNumber, IsOptional } from 'class-validator';

@ArgsType()
export class GetEventArgs extends PaginationQuery {
  @IsNumber()
  @Field(() => Int, { nullable: true })
  @IsOptional()
  templeId?: number;
}
