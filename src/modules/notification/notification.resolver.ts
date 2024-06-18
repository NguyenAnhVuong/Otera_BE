import { Args, Int, Mutation, Resolver, Subscription } from '@nestjs/graphql';
import { NotificationService } from './notification.service';
import { GQLRoles } from '@core/decorator/gqlRoles.decorator';
import { ERole } from '@core/enum';
import { NotificationsRes } from './entities/notificationsRes.entity';
import { GQLUserData } from '@core/decorator/gqlUser.decorator';
import { GQLArgsPaging } from '@core/decorator/gqlArgsPaging.decorator';
import { IUserData } from '@core/interface/default.interface';
import { GetNotificationsArgs } from './dto/get-notifications.args';
import { UpdateRes } from '@core/global/entities/updateRes.entity';
import { UpdateNotificationInput } from './dto/update-notification.input';

@Resolver()
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @GQLRoles(Object.values(ERole))
  @Subscription(() => NotificationsRes)
  getNotifications(
    @GQLUserData() userData: IUserData,
    @GQLArgsPaging()
    @Args()
    getNotificationsArgs: GetNotificationsArgs,
  ) {
    return this.notificationService.getNotifications(
      userData,
      getNotificationsArgs,
    );
  }

  @GQLRoles(Object.values(ERole))
  @Mutation(() => UpdateRes, { name: 'updateNotification' })
  async updateNotification(
    @GQLUserData() userData: IUserData,
    @Args('updateNotificationInput')
    updateNotificationInput: UpdateNotificationInput,
  ) {
    return this.notificationService.updateNotification(
      updateNotificationInput,
      userData.id,
    );
  }
}
