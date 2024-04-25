import { IUserData } from '@core/interface/default.interface';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { VBookingEventInput } from './dto/booking-event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EventParticipant } from '@core/database/entity/eventParticipant.entity';
import { Repository } from 'typeorm';
import { EventService } from '@modules/event/event.service';
import { ErrorMessage } from '@core/enum';

@Injectable()
export class EventParticipantService {
  constructor(
    @InjectRepository(EventParticipant)
    private readonly eventParticipantRepository: Repository<EventParticipant>,

    @Inject(forwardRef(() => EventService))
    private readonly eventService: EventService,
  ) {}
  async createEventParticipant(
    userData: IUserData,
    bookingEventInput: VBookingEventInput,
  ) {
    const event = await this.eventService.getEventById(
      bookingEventInput.eventId,
    );

    if (!event) {
      throw new HttpException(
        ErrorMessage.EVENT_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      new Date(event.startDateBooking) > new Date() ||
      new Date(event.endDateBooking) < new Date()
    ) {
      throw new HttpException(
        ErrorMessage.EVENT_NOT_BOOKING_TIME,
        HttpStatus.BAD_REQUEST,
      );
    }

    const currentParticipants = await this.getCurrentParticipantsByEventId(
      bookingEventInput.eventId,
    );

    if (event.maxParticipant <= currentParticipants) {
      throw new HttpException(
        ErrorMessage.EVENT_PARTICIPANT_FULL,
        HttpStatus.BAD_REQUEST,
      );
    }

    const isParticipantExist = await this.eventParticipantRepository.findOne({
      where: {
        userId: userData.id,
        eventId: bookingEventInput.eventId,
        isDeleted: false,
      },
    });

    if (isParticipantExist) {
      throw new HttpException(
        ErrorMessage.EVENT_PARTICIPANT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.eventParticipantRepository.save({
      ...bookingEventInput,
      userId: userData.id,
    });

    return true;
  }

  async getCurrentParticipantsByEventId(eventId: number) {
    const event = await this.eventService.getEventById(eventId);

    if (!event) {
      throw new HttpException(
        ErrorMessage.EVENT_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    const count = await this.eventParticipantRepository.count({
      where: { eventId, isDeleted: false },
    });
    console.log({ count });
    return count;
  }
}
