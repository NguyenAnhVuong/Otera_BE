import { Event } from '@core/database/entity/event.entity';
import { GQLResponse } from '@core/global/entities/gqlRes.entity';
import { PagingData } from '@core/global/entities/pagingData.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EventsPagingData extends PagingData {
  @Field(() => [Event])
  data: [Event];
}

@ObjectType()
export class EventsRes extends GQLResponse {
  @Field(() => EventsPagingData)
  data: EventsPagingData;
}
