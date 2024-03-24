import { IUserData } from '@core/interface/default.interface';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

    if (event.maxParticipant <= event.eventParticipants.length) {
      throw new HttpException(
        ErrorMessage.EVENT_PARTICIPANT_FULL,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      event.eventParticipants.find(
        (participant) => participant.userId === userData.id,
      )
    ) {
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
}
