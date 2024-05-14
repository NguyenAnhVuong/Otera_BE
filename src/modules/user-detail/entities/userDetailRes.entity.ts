import { UserDetail } from '@core/database/entity/userDetail.entity';
import { GQLResponse } from '@core/global/entities/gqlRes.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserDetailRes extends GQLResponse {
  @Field(() => UserDetail)
  data: UserDetail;
}
