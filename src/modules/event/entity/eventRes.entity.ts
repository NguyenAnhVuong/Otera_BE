import { Event } from '@core/database/entity/event.entity';
import { GQLResponse } from '@core/global/entities/gqlRes.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EventDetail extends Event {
  @Field(() => Number)
  currentParticipant: number;

  @Field(() => Boolean)
  isBooked: boolean;
}

@ObjectType()
export class EventRes extends GQLResponse {
  @Field(() => EventDetail, { nullable: true })
  data: EventDetail;
}
