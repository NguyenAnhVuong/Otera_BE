import { Temple } from '@core/database/entity/temple.entity';
import { User } from '@core/database/entity/user.entity';
import { GQLResponse } from '@core/global/entities/gqlRes.entity';
import { PagingData } from '@core/global/entities/pagingData.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TempleWithAdmin extends Temple {
  @Field(() => User)
  admin: User;
}

@ObjectType()
class TemplesPagingData extends PagingData {
  @Field(() => [TempleWithAdmin], { nullable: true })
  data: TempleWithAdmin[];
}

@ObjectType()
export class TemplesRes extends GQLResponse {
  @Field(() => TemplesPagingData)
  data: TemplesPagingData;
}
