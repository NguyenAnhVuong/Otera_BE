import { Offering } from '@core/database/entity/offering.entity';
import { GQLResponse } from '@core/global/entities/gqlRes.entity';
import { GQLPagingData } from '@core/global/entities/pagingData.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ListOffering extends GQLPagingData {
  @Field(() => [Offering])
  data: Offering[];
}

@ObjectType()
export class OfferingsRes extends GQLResponse {
  @Field(() => ListOffering)
  data: ListOffering;
}
