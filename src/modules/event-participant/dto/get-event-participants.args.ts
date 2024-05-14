import { EBookingStatus } from '@core/enum';
import { OrderBy } from '@core/global/entities/order.entity';
import { PaginationQuery } from '@core/global/entities/paginationQuery.entity';
import { ArgsType, Field, Int } from '@nestjs/graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

@ArgsType()
export class VGetEventParticipantsArgs extends PaginationQuery {
  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  eventId: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  email?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  address?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  familyName?: string;

  @Field(() => EBookingStatus)
  @IsEnum(EBookingStatus)
  @IsNotEmpty()
  bookingStatus: EBookingStatus;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isBelongToTemple?: boolean;

  @Field(() => [OrderBy], { nullable: true })
  @IsOptional()
  orderBy?: [OrderBy];
}
