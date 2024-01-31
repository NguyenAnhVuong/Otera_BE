import { DeathAnniversary } from '@core/database/entity/deathAnniversary.entity';
import { GraphQLResponse } from '@core/global/entities/graphQLRes.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DeathAnniversariesRes extends GraphQLResponse {
  @Field(() => [DeathAnniversary])
  data: DeathAnniversary;
}
