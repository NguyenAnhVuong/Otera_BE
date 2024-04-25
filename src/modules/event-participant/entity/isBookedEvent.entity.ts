import { GQLResponse } from '@core/global/entities/gqlRes.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class IsBookedEvent {
  @Field(() => Boolean)
  isBooked: boolean;
}

@ObjectType()
export class IsBookedEventRes extends GQLResponse {
  @Field(() => IsBookedEvent)
  data: IsBookedEvent;
}
