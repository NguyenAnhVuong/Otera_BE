import { Temple } from '@core/database/entity/temple.entity';
import { GQLResponse } from '@core/global/entities/gqlRes.entity';
import { PagingData } from '@core/global/entities/pagingData.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
class TemplesPagingData extends PagingData {
  @Field(() => [Temple], { nullable: true })
  data: Temple[];
}

@ObjectType()
export class TemplesRes extends GQLResponse {
  @Field(() => TemplesPagingData)
  data: TemplesPagingData;
}
