import { DeathAnniversary } from '@core/database/entity/deathAnniversary.entity';
import { GQLResponse } from '@core/global/entities/gqlRes.entity';
import { GQLPagingData } from '@core/global/entities/pagingData.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ListDeathAnniversary extends GQLPagingData {
  @Field(() => [DeathAnniversary])
  data: DeathAnniversary[];
}

@ObjectType()
export class DeathAnniversariesRes extends GQLResponse {
  @Field(() => ListDeathAnniversary)
  data: ListDeathAnniversary;
}
