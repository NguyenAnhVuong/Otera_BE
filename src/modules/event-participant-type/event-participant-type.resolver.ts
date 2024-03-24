import { Resolver } from '@nestjs/graphql';
import { EventParticipantTypeService } from './event-participant-type.service';

@Resolver()
export class EventParticipantTypeResolver {
  constructor(
    private readonly eventParticipantTypeService: EventParticipantTypeService,
  ) {}
}
