import { Notification } from '@core/database/entity/notification.entity';
import { GQLResponse } from '@core/global/entities/gqlRes.entity';
import { PagingData } from '@core/global/entities/pagingData.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NotificationsPagingData extends PagingData {
  @Field(() => [Notification])
  data: Notification[];
}

@ObjectType()
export class NotificationsRes extends GQLResponse {
  @Field(() => NotificationsPagingData)
  data: NotificationsPagingData;
}
