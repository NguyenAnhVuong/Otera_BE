import { FollowerTemple } from '@core/database/entity/followerTemple.entity';
import { GQLResponse } from '@core/global/entities/gqlRes.entity';
import { PagingData } from '@core/global/entities/pagingData.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FollowerTemplesPagingData extends PagingData {
  @Field(() => [FollowerTemple])
  data: FollowerTemple[];
}

@ObjectType()
export class FollowerTemplesRes extends GQLResponse {
  @Field(() => FollowerTemplesPagingData)
  data: FollowerTemplesPagingData;
}
