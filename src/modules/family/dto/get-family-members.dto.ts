import { ERole } from '@core/enum';
import { OrderBy } from '@core/global/entities/order.entity';
import { GQLPaginationArgs } from '@core/global/entities/paginationQuery.entity';
import { ArgsType, Field, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

@ArgsType()
export class GetFamilyMembersArgs extends GQLPaginationArgs {
  @Field(() => [OrderBy], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderBy)
  orderBy: OrderBy[];

  @Field(() => Int)
  @IsNumber()
  id: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  address: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  email: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  phone: string;

  @Field(() => [ERole], { nullable: true })
  @IsOptional()
  @IsEnum(ERole, { each: true })
  roleFilter: ERole[];
}
