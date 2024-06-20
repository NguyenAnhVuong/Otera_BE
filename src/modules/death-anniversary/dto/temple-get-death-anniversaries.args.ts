import { EDeathAnniversaryStatus, EDeathAnniversaryType } from '@core/enum';
import { OrderBy } from '@core/global/entities/order.entity';
import { GQLPaginationArgs } from '@core/global/entities/paginationQuery.entity';
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
export class VTempleGetDeathAnniversariesInput extends GQLPaginationArgs {
  @IsString()
  @Field(() => String, { nullable: true })
  @IsOptional()
  name?: string;

  @IsString()
  @Field(() => String, { nullable: true })
  @IsOptional()
  familyKeyword?: string;

  @IsString()
  @Field(() => String, { nullable: true })
  @IsOptional()
  tombAddress?: string;

  @IsString()
  @Field(() => String, { nullable: true })
  @IsOptional()
  requesterName?: string;

  @IsEnum(EDeathAnniversaryType, { each: true })
  @Field(() => [EDeathAnniversaryType], { nullable: true })
  @IsOptional()
  deathAnniversaryTypes?: EDeathAnniversaryType[];

  @IsEnum(EDeathAnniversaryStatus)
  @Field(() => EDeathAnniversaryStatus, { nullable: true })
  @IsOptional()
  status?: EDeathAnniversaryStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Field(() => [OrderBy], { nullable: true })
  @IsOptional()
  @Type(() => OrderBy)
  orderBy?: OrderBy[];
}
