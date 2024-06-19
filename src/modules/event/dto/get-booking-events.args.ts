import { EBookingStatus } from '@core/enum';
import { OrderBy } from '@core/global/entities/order.entity';
import { GQLPaginationArgs } from '@core/global/entities/paginationQuery.entity';
import { ArgsType, Field } from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';

@ArgsType()
export class GetBookingEventsArgs extends GQLPaginationArgs {
  @Field(() => String, { nullable: true })
  @IsOptional()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  address?: string;

  @Field(() => [OrderBy], { nullable: true })
  @IsOptional()
  orderBy?: OrderBy[];

  @Field(() => EBookingStatus, { nullable: true })
  @IsEnum(EBookingStatus)
  @IsOptional()
  bookingStatus?: EBookingStatus;
}
