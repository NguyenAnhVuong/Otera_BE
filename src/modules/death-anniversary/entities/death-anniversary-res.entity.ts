import { DeathAnniversary } from '@core/database/entity/deathAnniversary.entity';
import { GQLResponse } from '@core/global/entities/gqlRes.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DeathAnniversaryRes extends GQLResponse {
  @Field(() => DeathAnniversary)
  data: DeathAnniversary;
}
