import { EBookingStatus, ErrorMessage } from '@core/enum';
import { IUserData } from '@core/interface/default.interface';
import { EventService } from '@modules/event/event.service';
import { UserService } from '@modules/user/user.service';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { EventParticipant } from './../../core/database/entity/eventParticipant.entity';
import { VBookingEventInput } from './dto/booking-event.entity';
import { VGetEventParticipantsArgs } from './dto/get-event-participants.args';
import { UpdateEventParticipantInput } from './dto/update-event-participant.input';
import { generateRandomCode, returnPagingData } from '@helper/utils';
import { EVENT_PARTICIPANT_CODE_LENGTH } from '@core/constants';
import { VEventParticipantCheckInInput } from './dto/event-participant-check-in.input';

@Injectable()
export class EventParticipantService {
  constructor(
    @InjectRepository(EventParticipant)
    private readonly eventParticipantRepository: Repository<EventParticipant>,

    @Inject(forwardRef(() => EventService))
    private readonly eventService: EventService,

    private readonly userService: UserService,
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
      where: {
        eventId,
        isDeleted: false,
        bookingStatus: EBookingStatus.APPROVED,
      },
    });

    return count;
  }

  async checkExistedCode(eventParticipantId: number, code: string) {
    const eventParticipant = await this.eventParticipantRepository.findOne({
      where: {
        id: eventParticipantId,
        code,
        isDeleted: false,
      },
    });

    return !!eventParticipant;
  }

  async updateEventParticipant(
    bookingEventInput: UpdateEventParticipantInput,
    userData: IUserData,
  ) {
    const { eventParticipantId, ...newEventParticipant } = bookingEventInput;

    const eventParticipant = await this.eventParticipantRepository.findOne({
      where: {
        id: eventParticipantId,
        isDeleted: false,
      },
    });

    if (!eventParticipant) {
      throw new HttpException(
        ErrorMessage.EVENT_PARTICIPANT_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    let randomCode = null;
    if (newEventParticipant.bookingStatus === EBookingStatus.APPROVED) {
      randomCode = generateRandomCode(EVENT_PARTICIPANT_CODE_LENGTH);

      while (await this.checkExistedCode(eventParticipantId, randomCode)) {
        randomCode = generateRandomCode(EVENT_PARTICIPANT_CODE_LENGTH);
      }
    }

    return await this.eventParticipantRepository.update(
      {
        id: eventParticipantId,
        isDeleted: false,
      },
      {
        ...newEventParticipant,
        code: randomCode,
        approverId: userData.id,
      },
    );
  }

  async getEventParticipants(
    templeId: number,
    getEventParticipantsArgs: VGetEventParticipantsArgs,
  ) {
    const {
      eventId,
      bookingStatus,
      skip,
      take,
      name,
      email,
      address,
      familyName,
      isBelongToTemple,
      orderBy,
    } = getEventParticipantsArgs;
    const query = this.eventParticipantRepository
      .createQueryBuilder('eventParticipant')
      .where('eventParticipant.eventId = :eventId', { eventId })
      .andWhere('eventParticipant.isDeleted = false')
      .andWhere('eventParticipant.bookingStatus = :bookingStatus', {
        bookingStatus,
      })
      .leftJoinAndSelect('eventParticipant.event', 'event')
      .andWhere('event.templeId = :templeId', { templeId })
      .leftJoinAndSelect('eventParticipant.user', 'user')
      .leftJoinAndSelect('user.userDetail', 'userDetail')
      .leftJoinAndSelect('eventParticipant.approver', 'approver')
      .leftJoinAndSelect('approver.userDetail', 'approverDetail')
      .leftJoinAndSelect('user.family', 'family')
      .leftJoinAndSelect('family.familyTemples', 'familyTemples')
      .skip(skip)
      .take(take);

    if (isBelongToTemple) {
      query.andWhere('familyTemples.templeId = :templeId', { templeId });
    }
    if (name) {
      query.andWhere('userDetail.name = :name', { name });
    }
    if (email) {
      query.andWhere('user.email = :email', { email });
    }
    if (address) {
      query.andWhere('userDetail.address = :address', { address });
    }
    if (familyName) {
      query
        .leftJoin('user.family', 'family')
        .andWhere('family.name = :familyName', { familyName });
    }
    if (orderBy && orderBy.length > 0) {
      orderBy.forEach((order) => {
        query.addOrderBy(`eventParticipant.${order.column}`, order.sortOrder);
      });
    }

    const [data, count] = await query.getManyAndCount();

    const eventParticipants = await Promise.all(
      data.map(async (eventParticipant) => {
        return {
          familyName: eventParticipant.user.family?.name,
          isBelongToTemple: !!(
            eventParticipant.user.family?.familyTemples.length > 0
          ),
          ...eventParticipant,
        };
      }),
    );

    return returnPagingData(eventParticipants, count, getEventParticipantsArgs);
  }

  async eventParticipantCheckIn(
    eventParticipantCheckInInput: VEventParticipantCheckInInput,
    userData: IUserData,
  ) {
    const eventParticipant = await this.eventParticipantRepository.findOne({
      where: {
        eventId: eventParticipantCheckInInput.eventId,
        code: eventParticipantCheckInInput.code,
        isDeleted: false,
        event: {
          templeId: userData.tid[0],
          startDateEvent: LessThanOrEqual(new Date()),
          endDateEvent: MoreThanOrEqual(new Date()),
        },
      },
      relations: ['event'],
    });

    if (!eventParticipant) {
      throw new HttpException(
        ErrorMessage.NO_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (eventParticipant.event.endDateEvent < new Date()) {
      throw new HttpException(
        ErrorMessage.EVENT_IS_ENDED,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.eventParticipantRepository.update(
      {
        id: eventParticipant.id,
        isDeleted: false,
      },
      {
        checkInAt: new Date(),
      },
    );
  }

  async cancelBookingEvent(eventId: number, userData: IUserData) {
    const eventParticipant = await this.eventParticipantRepository.findOne({
      where: {
        eventId,
        userId: userData.id,
        isDeleted: false,
      },
      relations: ['event'],
    });

    if (!eventParticipant) {
      throw new HttpException(
        ErrorMessage.EVENT_PARTICIPANT_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (eventParticipant.event.endDateBooking < new Date()) {
      throw new HttpException(
        ErrorMessage.EVENT_IS_ENDED,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.eventParticipantRepository.update(
      {
        id: eventParticipant.id,
        isDeleted: false,
      },
      {
        isDeleted: true,
      },
    );
  }
}
