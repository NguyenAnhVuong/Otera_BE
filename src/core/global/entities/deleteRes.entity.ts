import { Field, ObjectType } from '@nestjs/graphql';
import { GQLResponse } from './gqlRes.entity';

@ObjectType()
export class DeleteRes extends GQLResponse {
  @Field(() => Boolean)
  data: boolean;
}
