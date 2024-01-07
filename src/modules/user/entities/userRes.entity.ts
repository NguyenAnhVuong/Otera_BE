import { User } from '@core/database/entity/user.entity';
import { GraphQLResponse } from '@core/global/entities/graphQLRes.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserRes extends GraphQLResponse {
  @Field(() => User)
  data: User;
}
