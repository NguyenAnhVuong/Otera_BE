import { Event } from '@core/database/entity/event.entity';
import { GQLResponse } from '@core/global/entities/gqlRes.entity';
import { GQLPagingData } from '@core/global/entities/pagingData.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BookingEventsPagingData extends GQLPagingData {
  @Field(() => [Event])
  data: [Event];
}

@ObjectType()
export class BookingEventsRes extends GQLResponse {
  @Field(() => BookingEventsPagingData)
  data: BookingEventsPagingData;
}
