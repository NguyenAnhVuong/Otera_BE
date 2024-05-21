import { User } from '@core/database/entity/user.entity';
import { GQLResponse } from '@core/global/entities/gqlRes.entity';
import { PagingData } from '@core/global/entities/pagingData.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FamilyMembers extends PagingData {
  @Field(() => [User])
  data: User[];
}

@ObjectType()
export class FamilyMembersRes extends GQLResponse {
  @Field(() => FamilyMembers)
  data: FamilyMembers;
}
