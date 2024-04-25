import { GQLArgsPaging } from '@core/decorator/gqlQueryPaging.decorator';
import { GQLRoles } from '@core/decorator/gqlRoles.decorator';
import { GQLUserData } from '@core/decorator/gqlUser.decorator';
import { IsPublicOrAuth } from '@core/decorator/publicOrAuth.decorator';
import { ERole } from '@core/enum';
import { CreateRes } from '@core/global/entities/createRes.entity';
import { UpdateRes } from '@core/global/entities/updateRes.entity';
import { IUserData } from '@core/interface/default.interface';
import { HttpStatus, ParseIntPipe } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { VCreateEventInput } from './dto/create-event.input';
import { GetEventArgs } from './dto/get-event.args';
import { TempleGetEventArgs } from './dto/temple-get-event.args';
import { VUpdateEventInput } from './dto/update-event.input';
import { EventRes } from './entity/eventRes.entity';
import { EventsRes } from './entity/eventsRes.entity';
import { EventService } from './event.service';

@Resolver()
export class EventResolver {
  constructor(private readonly eventService: EventService) {}

  @GQLRoles([ERole.TEMPLE_ADMIN, ERole.TEMPLE_MEMBER])
  @Query(() => EventsRes, { name: 'templeGetEvents' })
  templeGetEvents(
    @GQLUserData() userData: IUserData,
    @Args() @GQLArgsPaging() args: TempleGetEventArgs,
  ) {
    return this.eventService.templeGetEvents(userData, args);
  }

  @IsPublicOrAuth()
  @Query(() => EventsRes, { name: 'getEvents' })
  getEvents(
    @GQLUserData() userData: IUserData,
    @Args() @GQLArgsPaging() args: GetEventArgs,
  ) {
    return this.eventService.getEvents(userData, args);
  }

  @IsPublicOrAuth()
  @Query(() => EventRes, { name: 'getEventById' })
  getEventById(
    @GQLUserData() userData: IUserData,
    @Args(
      'id',
      { type: () => Int },
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
      }),
    )
    id: number,
  ) {
    return this.eventService.getEventDetailById(id, userData);
  }

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
  updateEvent(
    @Args('updateEventInput') updateEventInput: VUpdateEventInput,
    @GQLUserData() userData: IUserData,
  ) {
    return this.eventService.updateEvent(updateEventInput, userData);
  }
}
