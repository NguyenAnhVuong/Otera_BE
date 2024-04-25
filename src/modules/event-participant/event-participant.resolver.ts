import { GQLRoles } from '@core/decorator/gqlRoles.decorator';
import { GQLUserData } from '@core/decorator/gqlUser.decorator';
import { ERole } from '@core/enum';
import { CreateRes } from '@core/global/entities/createRes.entity';
import { IUserData } from '@core/interface/default.interface';
import { Args, Mutation, Query, Resolver, Int } from '@nestjs/graphql';
import { VBookingEventInput } from './dto/booking-event.entity';
import { EventParticipantService } from './event-participant.service';
import { IsBookedEventRes } from './entity/isBookedEvent.entity';
import { HttpStatus, ParseIntPipe } from '@nestjs/common';

@Resolver()
export class EventParticipantResolver {
  constructor(
    private readonly eventParticipantService: EventParticipantService,
  ) {}

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
}
