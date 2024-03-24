import { Field, ObjectType } from '@nestjs/graphql';
import { GQLResponse } from './gqlRes.entity';

@ObjectType()
export class CreateRes extends GQLResponse {
  @Field(() => Boolean)
  data: boolean;
}
