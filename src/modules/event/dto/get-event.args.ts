import { PaginationQuery } from '@core/global/entities/paginationQuery.entity';
import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional, ValidateIf } from 'class-validator';

@ArgsType()
export class GetEventArgs extends PaginationQuery {
  @IsNumber()
  @Field(() => Int, { nullable: true })
  @IsOptional()
  templeId?: number;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  @ValidateIf((o) => !o.ended)
  upcoming?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  @ValidateIf((o) => !o.upcoming)
  ended?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  priority?: boolean;
}
