import { Temple } from '@core/database/entity/temple.entity';
import { GQLResponse } from '@core/global/entities/gqlRes.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TempleRes extends GQLResponse {
  @Field(() => Temple)
  data: Temple;
}
