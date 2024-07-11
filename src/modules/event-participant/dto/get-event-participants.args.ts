import { EBookingStatus } from '@core/enum';
import { OrderBy } from '@core/global/entities/order.entity';
import { GQLPaginationArgs } from '@core/global/entities/paginationQuery.entity';
import { ArgsType, Field, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

@ArgsType()
export class VGetEventParticipantsArgs extends GQLPaginationArgs {
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
  familyKeyword?: string;

  @Field(() => EBookingStatus)
  @IsEnum(EBookingStatus)
  @IsNotEmpty()
  bookingStatus: EBookingStatus;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isFollowing?: boolean;

  @Field(() => [OrderBy], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderBy)
  orderBy?: [OrderBy];
}
