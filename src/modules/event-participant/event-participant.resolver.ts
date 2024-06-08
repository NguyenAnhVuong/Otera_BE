import { GQLArgsPaging } from '@core/decorator/gqlQueryPaging.decorator';
import { GQLRoles } from '@core/decorator/gqlRoles.decorator';
import { GQLUserData } from '@core/decorator/gqlUser.decorator';
import { ERole } from '@core/enum';
import { CreateRes } from '@core/global/entities/createRes.entity';
import { UpdateRes } from '@core/global/entities/updateRes.entity';
import { IUserData } from '@core/interface/default.interface';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { VBookingEventInput } from './dto/booking-event.entity';
import { VEventParticipantCheckInInput } from './dto/event-participant-check-in.input';
import { VGetEventParticipantsArgs } from './dto/get-event-participants.args';
import { UpdateEventParticipantInput } from './dto/update-event-participant.input';
import { EventParticipantsRes } from './entity/eventParticipantsRes.entity';
import { EventParticipantService } from './event-participant.service';
import { HttpStatus, ParseIntPipe } from '@nestjs/common';

@Resolver()
export class EventParticipantResolver {
  constructor(
    private readonly eventParticipantService: EventParticipantService,
  ) {}

  // TODO family to public user only, if the temple wants to participate, create a new account and register as a public user
  @GQLRoles([
    ERole.TEMPLE_ADMIN,
    ERole.FAMILY_ADMIN,
    ERole.FAMILY_MEMBER,
    ERole.PUBLIC_USER,
  ])
  @Mutation(() => CreateRes, { name: 'bookingEvent' })
  bookingEvent(
    @Args('bookingEventInput') bookingEventInput: VBookingEventInput,
    @GQLUserData() userData: IUserData,
  ) {
    return this.eventParticipantService.createEventParticipant(
      userData,
      bookingEventInput,
    );
  }

  @GQLRoles([ERole.TEMPLE_ADMIN, ERole.TEMPLE_MEMBER])
  @Mutation(() => UpdateRes, { name: 'updateEventParticipant' })
  updateEventParticipant(
    @Args('bookingEventInput') bookingEventInput: UpdateEventParticipantInput,
    @GQLUserData() userData: IUserData,
  ) {
    return this.eventParticipantService.updateEventParticipant(
      bookingEventInput,
      userData,
    );
  }

  @GQLRoles([ERole.TEMPLE_ADMIN, ERole.TEMPLE_MEMBER])
  @Query(() => EventParticipantsRes, { name: 'getEventParticipants' })
  getEventParticipants(
    @GQLUserData() userData: IUserData,
    @Args()
    @GQLArgsPaging()
    getEventParticipantsArgs: VGetEventParticipantsArgs,
  ) {
    return this.eventParticipantService.getEventParticipants(
      userData.tid[0],
      getEventParticipantsArgs,
    );
  }

  @GQLRoles([ERole.TEMPLE_ADMIN, ERole.TEMPLE_MEMBER])
  @Mutation(() => UpdateRes, { name: 'eventParticipantCheckIn' })
  eventParticipantCheckIn(
    @GQLUserData() userData: IUserData,
    @Args('eventParticipantCheckInInput')
    eventParticipantCheckInInput: VEventParticipantCheckInInput,
  ) {
    return this.eventParticipantService.eventParticipantCheckIn(
      eventParticipantCheckInInput,
      userData,
    );
  }

  @GQLRoles(Object.values(ERole))
  @Mutation(() => UpdateRes, { name: 'cancelBookingEvent' })
  cancelBookingEvent(
    @GQLUserData() userData: IUserData,
    @Args(
      'eventId',
      { type: () => Int },
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
      }),
    )
    eventId: number,
  ) {
    return this.eventParticipantService.cancelBookingEvent(eventId, userData);
  }
}
