import { Deceased } from '@core/database/entity/deceased.entity';
import { GQLResponse } from '@core/global/entities/gqlRes.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ListDeceasedRes extends GQLResponse {
  @Field(() => [Deceased])
  data: Deceased[];
}
