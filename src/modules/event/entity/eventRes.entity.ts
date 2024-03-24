import { Event } from '@core/database/entity/event.entity';
import { GQLResponse } from '@core/global/entities/gqlRes.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EventRes extends GQLResponse {
  @Field(() => Event)
  data: Event;
}
