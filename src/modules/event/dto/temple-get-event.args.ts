import { PaginationQuery } from '@core/global/entities/paginationQuery.entity';
import { ArgsType, Field } from '@nestjs/graphql';
import { IsBoolean, IsOptional, ValidateIf } from 'class-validator';

@ArgsType()
export class TempleGetEventArgs extends PaginationQuery {
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
