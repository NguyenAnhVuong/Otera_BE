import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GraphQLResponse {
  @Field(() => Int)
  statusCode: number;

  @Field(() => String, { nullable: true })
  errorMessage: string;

  @Field(() => String, { nullable: true })
  errorCode: string;

  @Field(() => String)
  timestamp: string;
}
