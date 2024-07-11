import { EventParticipant } from '@core/database/entity/eventParticipant.entity';
import { GQLResponse } from '@core/global/entities/gqlRes.entity';
import { GQLPagingData } from '@core/global/entities/pagingData.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EventParticipantRes extends EventParticipant {
  @Field(() => Boolean)
  isFollowing: boolean;

  @Field(() => String, { nullable: true })
  familyName?: string;

  @Field(() => String, { nullable: true })
  familyCode?: string;
}

@ObjectType()
export class ListEventParticipant extends GQLPagingData {
  @Field(() => [EventParticipantRes], { nullable: true })
  data: EventParticipantRes[];
}

@ObjectType()
export class EventParticipantsRes extends GQLResponse {
  @Field(() => ListEventParticipant, { nullable: true })
  data: ListEventParticipant;
}
