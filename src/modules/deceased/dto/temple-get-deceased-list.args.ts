import { EStatus } from '@core/enum';
import { OrderBy } from '@core/global/entities/order.entity';
import { PaginationQuery } from '@core/global/entities/paginationQuery.entity';
import { ArgsType, Field } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

@ArgsType()
export class VTempleGetListDeceasedArgs extends PaginationQuery {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  address?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  tombAddress?: string;

  @Field(() => EStatus, { nullable: true })
  @IsString()
  @IsOptional()
  status?: EStatus;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  familyKeyword?: string;

  @Field(() => [OrderBy], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => OrderBy)
  orderBy?: OrderBy[];
}
