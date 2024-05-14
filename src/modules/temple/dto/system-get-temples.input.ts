import { EPriority, EStatus } from '@core/enum';
import { PaginationQuery } from '@core/global/entities/paginationQuery.entity';
import { ArgsType, Field } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

@ArgsType()
export class VSystemGetTemplesDto extends PaginationQuery {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  keyword?: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  familyId?: number;

  @Field(() => EPriority, { nullable: true })
  @IsOptional()
  @IsEnum(EPriority)
  priority?: EPriority;

  @Field(() => EStatus, { nullable: true })
  @IsOptional()
  @IsEnum(EStatus)
  status?: EStatus;

  // @IsNumber()
  // @Field(() => Int, { nullable: true })
  // @IsOptional()
  // page?: number;

  // @Field(() => Int, { nullable: true })
  // @IsNumber()
  // @IsOptional()
  // take?: number;
}
