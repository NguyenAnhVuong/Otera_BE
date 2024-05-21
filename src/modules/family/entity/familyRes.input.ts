import { Family } from '@core/database/entity/family.entity';
import { GQLResponse } from '@core/global/entities/gqlRes.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FamilyRes extends GQLResponse {
  @Field(() => Family)
  data: Family;
}
