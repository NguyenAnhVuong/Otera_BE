import { User } from '@core/database/entity/user.entity';
import { GQLResponse } from '@core/global/entities/gqlRes.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserRes extends GQLResponse {
  @Field(() => User)
  data: User;
}
