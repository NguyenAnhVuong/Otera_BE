import { GQLRoles } from '@core/decorator/gqlRoles.decorator';
import { ERole } from '@core/enum';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { VCreateEventInput } from './dto/create-event.input';
import { EventRes } from './entity/eventRes.entity';
import { EventService } from './event.service';
import { GQLUserData } from '@core/decorator/gqlUser.decorator';
import { IUserData } from '@core/interface/default.interface';
import { VUpdateEventInput } from './dto/update-event.input';
import { UpdateRes } from '@core/global/entities/updateRes.entity';

@Resolver()
export class EventResolver {
  constructor(private readonly eventService: EventService) {}

  @GQLRoles([ERole.TEMPLE_ADMIN, ERole.TEMPLE_MEMBER])
  @Mutation(() => EventRes, { name: 'createEvent' })
  createEvent(
    @Args('createEventInput') createEventInput: VCreateEventInput,
    @GQLUserData() userData: IUserData,
  ) {
    return this.eventService.createEvent(userData, createEventInput);
  }

  @GQLRoles([ERole.TEMPLE_ADMIN, ERole.TEMPLE_MEMBER])
  @Mutation(() => UpdateRes, { name: 'updateEvent' })
  updateEvent(@Args('updateEventInput') updateEventInput: VUpdateEventInput) {
    return this.eventService.updateEvent(updateEventInput);
  }
}
