import { Deceased } from '@core/database/entity/deceased.entity';
import { GQLResponse } from '@core/global/entities/gqlRes.entity';
import { PagingData } from '@core/global/entities/pagingData.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DeceasedPaging extends PagingData {
  @Field(() => [Deceased])
  data: Deceased[];
}

@ObjectType()
export class DeceasedListRes extends GQLResponse {
  @Field(() => DeceasedPaging)
  data: DeceasedPaging;
}
