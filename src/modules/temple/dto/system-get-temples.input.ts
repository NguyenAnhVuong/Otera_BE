import { EPriority, EStatus } from '@core/enum';
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
export class VSystemGetTemplesDto extends PaginationQuery {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  email?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  address?: number;

  @Field(() => EStatus, { nullable: true })
  @IsOptional()
  @IsEnum(EStatus)
  status?: EStatus;

  @Field(() => [OrderBy], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderBy)
  orderBy?: OrderBy[];
}
