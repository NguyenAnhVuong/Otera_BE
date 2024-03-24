import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GQLResponse {
  @Field(() => Int)
  statusCode: number;

  @Field(() => String, { nullable: true })
  errorMessage: string | null;

  @Field(() => String, { nullable: true })
  errorCode: string | null;

  @Field(() => String)
  timestamp: string;
}
