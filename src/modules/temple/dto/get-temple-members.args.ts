import { ERole } from '@core/enum';
import { OrderBy } from '@core/global/entities/order.entity';
import { PaginationQuery } from '@core/global/entities/paginationQuery.entity';
import { ArgsType, Field } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

@ArgsType()
export class VGetTempleMembersArgs extends PaginationQuery {
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
  phone?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  address?: string;

  @Field(() => [ERole], { nullable: true })
  @IsEnum(ERole, { each: true })
  roles?: ERole[];

  @Field(() => [OrderBy], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderBy)
  @IsOptional()
  orderBy?: OrderBy[];
}
