import { OrderBy } from '@core/global/entities/order.entity';
import { GQLPaginationArgs } from '@core/global/entities/paginationQuery.entity';
import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@ArgsType()
export class VFamilyGetListDeceasedArgs extends GQLPaginationArgs {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  keyword?: string;

  @Field(() => OrderBy, { nullable: true })
  @IsOptional()
  orderBy?: OrderBy;
}
