import { User } from '@core/database/entity/user.entity';
import { GQLResponse } from '@core/global/entities/gqlRes.entity';
import { PagingData } from '@core/global/entities/pagingData.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TempleMembersPagingData extends PagingData {
  @Field(() => [User], { nullable: true })
  data: User[];
}

@ObjectType()
export class TempleMembersRes extends GQLResponse {
  @Field(() => TempleMembersPagingData)
  data: TempleMembersPagingData;
}
