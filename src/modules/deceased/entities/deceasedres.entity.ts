import { Deceased } from '@core/database/entity/deceased.entity';
import { GraphQLResponse } from '@core/global/entities/graphQLRes.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DeceasedRes extends GraphQLResponse {
  @Field(() => Deceased)
  data: Deceased;
}
