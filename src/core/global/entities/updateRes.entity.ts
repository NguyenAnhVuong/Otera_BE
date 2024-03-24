import { Field, Int, ObjectType } from '@nestjs/graphql';
import { GQLResponse } from './gqlRes.entity';

@ObjectType()
class AffectedResult {
  @Field(() => Int)
  affected: number;
}

@ObjectType()
export class UpdateRes extends GQLResponse {
  @Field(() => AffectedResult, { nullable: true })
  data: AffectedResult | null;
}
