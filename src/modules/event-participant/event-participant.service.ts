import {
  EBookingStatus,
  EMailType,
  ENotificationType,
  ErrorMessage,
} from '@core/enum';
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
import { In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { EventParticipant } from './../../core/database/entity/eventParticipant.entity';
import { VBookingEventInput } from './dto/booking-event.entity';
import { VGetEventParticipantsArgs } from './dto/get-event-participants.args';
import { UpdateEventParticipantInput } from './dto/update-event-participant.input';
import {
  generateRandomCode,
  getMailFormat,
  returnPagingData,
} from '@helper/utils';
import { EVENT_PARTICIPANT_CODE_LENGTH, Notifications } from '@core/constants';
import { VEventParticipantCheckInInput } from './dto/event-participant-check-in.input';
import { sendMail } from '@helper/mailtrap';
import * as format from 'string-format';
import * as dayjs from 'dayjs';
import { FormatDate } from '@core/constants/formatDate';
import { ConfigService } from '@nestjs/config';
import { EConfiguration } from '@core/config';
import { NotificationService } from '@modules/notification/notification.service';

@Injectable()
export class EventParticipantService {
  constructor(
    @InjectRepository(EventParticipant)
    private readonly eventParticipantRepository: Repository<EventParticipant>,

    @Inject(forwardRef(() => EventService))
    private readonly eventService: EventService,

    private readonly configService: ConfigService,

    private readonly notificationService: NotificationService,

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

  // TODO add mail and notification when reject and notification when approve
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
      relations: ['user', 'user.userDetail', 'event', 'event.temple'],
    });

    if (!eventParticipant) {
      throw new HttpException(
        ErrorMessage.EVENT_PARTICIPANT_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    let randomCode = null;
    if (newEventParticipant.bookingStatus === EBookingStatus.APPROVED) {
      const event = await this.eventService.getEventAndParticipantById(
        eventParticipant.eventId,
      );

      if (!event) {
        throw new HttpException(
          ErrorMessage.EVENT_NOT_EXIST,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (event.maxParticipant >= event.eventParticipants.length) {
        throw new HttpException(
          ErrorMessage.EVENT_PARTICIPANT_FULL,
          HttpStatus.BAD_REQUEST,
        );
      }

      randomCode = generateRandomCode(EVENT_PARTICIPANT_CODE_LENGTH);
      const mailFormat = getMailFormat(EMailType.APPROVE_EVENT_PARTICIPANT);

      await this.notificationService.createNotification({
        userId: eventParticipant.userId,
        title: Notifications.approveBookingEvent.title,
        description: Notifications.approveBookingEvent.description(event.name),
        redirectTo: Notifications.approveBookingEvent.redirectTo(event.id),
        type: ENotificationType.APPROVE_EVENT_PARTICIPANT,
      });

      sendMail({
        to: eventParticipant.user.email,
        title: mailFormat.title,
        content: format(mailFormat.content, {
          eventParticipantName: eventParticipant.user.userDetail.name,
          eventName: eventParticipant.event.name,
          templeName: eventParticipant.event.temple.name,
          approverName: userData.name,
          code: randomCode,
          startDateEvent: dayjs(eventParticipant.event.startDateEvent).format(
            FormatDate.HH_mm_DD_MM_YYYY,
          ),
          eventAddress: eventParticipant.event.address,
          eventPhone: eventParticipant.event.phone
            ? 'Điện thoại: ' + eventParticipant.event.phone
            : '',
          eventEmail: eventParticipant.event.email
            ? 'Email: ' + eventParticipant.event.email
            : '',
          eventDetailUrl:
            this.configService.get(EConfiguration.CLIENT_URL) +
            '/event/' +
            eventParticipant.event.id,
        }),
      });
      while (await this.checkExistedCode(eventParticipantId, randomCode)) {
        randomCode = generateRandomCode(EVENT_PARTICIPANT_CODE_LENGTH);
      }
    }

    if (newEventParticipant.bookingStatus === EBookingStatus.REJECTED) {
      const mailFormat = getMailFormat(EMailType.REJECT_EVENT_PARTICIPANT);
      await this.notificationService.createNotification({
        userId: eventParticipant.userId,
        title: Notifications.rejectBookingEvent.title,
        description: Notifications.rejectBookingEvent.description(
          eventParticipant.event.name,
        ),
        redirectTo: Notifications.rejectBookingEvent.redirectTo(
          eventParticipant.eventId,
        ),
        type: ENotificationType.REJECT_EVENT_PARTICIPANT,
      });

      sendMail({
        to: eventParticipant.user.email,
        title: mailFormat.title,
        content: format(mailFormat.content, {
          eventParticipantName: eventParticipant.user.userDetail.name,
          eventName: eventParticipant.event.name,
          templeName: eventParticipant.event.temple.name,
          approverName: userData.name,
          rejectReason: newEventParticipant.rejectReason
            ? 'Lý do từ chối: ' + newEventParticipant.rejectReason
            : '',
          eventPhone: eventParticipant.event.phone
            ? 'Điện thoại: ' + eventParticipant.event.phone
            : '',
          eventEmail: eventParticipant.event.email
            ? 'Email: ' + eventParticipant.event.email
            : '',
          eventDetailUrl:
            this.configService.get(EConfiguration.CLIENT_URL) +
            '/event/' +
            eventParticipant.event.id,
        }),
      });
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
      isFollowing,
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
      .leftJoinAndSelect(
        'user.followerTemples',
        'followerTemples',
        'followerTemples.templeId = :templeId',
        { templeId },
      )
      .skip(skip)
      .take(take);

    if (isFollowing) {
      query.andWhere('followerTemples.templeId = :templeId', { templeId });
    }
    if (name) {
      query.andWhere('userDetail.name ILIKE :name', { name: `%${name}%` });
    }
    if (email) {
      query.andWhere('user.email ILIKE :email', { email: `%${email}%` });
    }
    if (address) {
      query.andWhere('userDetail.address ILIKE :address', {
        address: `%${address}%`,
      });
    }
    if (familyName) {
      query
        .leftJoin('user.family', 'family')
        .andWhere('family.name ILIKE :familyName', {
          familyName: `%${familyName}%`,
        });
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
          isFollowing: !!eventParticipant.user.followerTemples.length,
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

  getBookingAndApproveEventParticipants(eventId: number) {
    return this.eventParticipantRepository.find({
      where: {
        eventId,
        isDeleted: false,
        bookingStatus: In([EBookingStatus.APPROVED, EBookingStatus.BOOKING]),
      },
      relations: ['user', 'user.userDetail'],
    });
  }
}
