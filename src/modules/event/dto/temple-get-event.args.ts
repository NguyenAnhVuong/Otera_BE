import { OrderBy } from '@core/global/entities/order.entity';
import { PaginationQuery } from '@core/global/entities/paginationQuery.entity';
import { ArgsType, Field } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, ValidateIf } from 'class-validator';

// @InputType()
// export class TempleGetEventOrderBy {
//   @Field(() => EOrderBy, { nullable: true })
//   @IsOptional()
//   @IsEnum(EOrderBy)
//   startDateEvent?: EOrderBy;

//   @Field(() => EOrderBy, { nullable: true })
//   @IsOptional()
//   @IsEnum(EOrderBy)
//   endDateEvent?: EOrderBy;

//   @Field(() => EOrderBy, { nullable: true })
//   @IsOptional()
//   @IsEnum(EOrderBy)
//   startDateBooking?: EOrderBy;

//   @Field(() => EOrderBy, { nullable: true })
//   @IsOptional()
//   @IsEnum(EOrderBy)
//   endDateBooking?: EOrderBy;

//   @Field(() => EOrderBy, { nullable: true })
//   @IsOptional()
//   @IsEnum(EOrderBy)
//   priority?: EOrderBy;

//   @Field(() => EOrderBy, { nullable: true })
//   @IsOptional()
//   @IsEnum(EOrderBy)
//   bookingParticipant?: EOrderBy;

//   @Field(() => EOrderBy, { nullable: true })
//   @IsOptional()
//   @IsEnum(EOrderBy)
//   createdDate?: EOrderBy;
// }

@ArgsType()
export class TempleGetEventArgs extends PaginationQuery {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  @ValidateIf((o) => !o.ended && !o.happening)
  upcoming?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  @ValidateIf((o) => !o.upcoming && !o.ended)
  onGoing?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  @ValidateIf((o) => !o.upcoming && !o.happening)
  ended?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isFreeOpen?: boolean;

  @Field(() => [OrderBy], { nullable: true })
  @IsOptional()
  orderBy?: [OrderBy];
}
