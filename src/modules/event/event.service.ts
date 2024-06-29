import { Event } from '@core/database/entity/event.entity';
import { EventParticipant } from '@core/database/entity/eventParticipant.entity';
import { EBookingStatus, ERole, ErrorMessage } from '@core/enum';
import { QueueProcessorService } from '@core/global/queueProcessor/quequeProcessor.service';
import { QUEUE_MODULE_OPTIONS } from '@core/global/queueProcessor/queueIdentity.constant';
import { IUserData } from '@core/interface/default.interface';
import { returnPagingData } from '@helper/utils';
import { EventParticipantTypeService } from '@modules/event-participant-type/event-participant-type.service';
import { EventParticipantService } from '@modules/event-participant/event-participant.service';
import { ImageService } from '@modules/image/image.service';
import { NotificationService } from '@modules/notification/notification.service';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeepPartial, EntityManager, Repository } from 'typeorm';
import { VCreateEventInput } from './dto/create-event.input';
import { GetBookingEventsArgs } from './dto/get-booking-events.args';
import { GetEventArgs } from './dto/get-event.args';
import { TempleGetEventArgs } from './dto/temple-get-event.args';
import { VUpdateEventInput } from './dto/update-event.input';
import { EventParticipantType } from '@core/database/entity/eventParticipantType.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    private readonly eventParticipantTypeService: EventParticipantTypeService,

    private readonly imageService: ImageService,

    @Inject(forwardRef(() => EventParticipantService))
    private readonly eventParticipantService: EventParticipantService,

    private readonly notificationService: NotificationService,

    private readonly queueProcessorService: QueueProcessorService,

    private readonly dataSource: DataSource,
  ) {}

  async getEvents(userData: IUserData, args: GetEventArgs) {
    const { templeId, take, skip } = args;

    const currentDate = new Date();
    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .where(`event."isDeleted" = :isDeleted`, { isDeleted: false })
      .leftJoinAndMapOne(
        `event.event_participant_types`,
        EventParticipantType,
        'event_participant_types',
        'event_participant_types.eventId = event.id AND event_participant_types.isDeleted = false',
      )
      .skip(skip)
      .take(take)
      .addSelect(
        `
        CASE
          WHEN event."startDateEvent" > :currentDate THEN 1
          WHEN event."startDateEvent" <= :currentDate AND event."endDateEvent" >= :currentDate THEN 2
          ELSE 3
        END`,
        'event_order',
      )
      .addSelect(
        `
        NULLIF(
          CASE
            WHEN event."startDateEvent" <= :currentDate AND event."endDateEvent" >= :currentDate THEN event."startDateEvent"::text
            ELSE NULL
          END,
        '')`,
        'current_event_order',
      )
      .addSelect(
        `
        NULLIF(
          CASE
            WHEN event."endDateEvent" <= :currentDate THEN event."endDateEvent"::text
            ELSE NULL
          END,
        '')`,
        'past_event_order',
      )
      .orderBy('event_order', 'ASC')
      .addOrderBy('current_event_order', 'DESC')
      .addOrderBy('past_event_order', 'DESC')
      .setParameter('currentDate', currentDate);

    if (templeId) {
      queryBuilder.andWhere(`event."templeId" = :templeId`, { templeId });
    }

    if (userData) {
      queryBuilder.andWhere(
        `(event_participant_types."role" = :publicUserRole OR event_participant_types."role" = :role OR event."isFreeOpen" = true)`,
        {
          role: userData.role,
          publicUserRole: ERole.PUBLIC_USER,
        },
      );
    } else {
      queryBuilder.andWhere(
        `(event_participant_types."role" = :role OR event."isFreeOpen" = true)`,
        {
          role: ERole.PUBLIC_USER,
        },
      );
    }

    const [events, count] = await queryBuilder.getManyAndCount();

    return returnPagingData(events, count, args);
  }

  async templeGetEvents(userData: IUserData, args: TempleGetEventArgs) {
    const { tid: templeId } = userData;
    const { take, skip, name, upcoming, onGoing, ended, orderBy, isFreeOpen } =
      args;

    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .where('event.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('event.templeId = :templeId', { templeId: templeId[0] })
      .leftJoinAndSelect(
        'event.eventParticipantTypes',
        'eventParticipantTypes',
        'eventParticipantTypes.isDeleted = false',
      )
      .loadRelationCountAndMap(
        'eventParticipants.currentParticipant',
        'event.eventParticipants',
        'currentParticipant',
        (qb) =>
          qb.where(
            'currentParticipant.isDeleted = false AND currentParticipant.bookingStatus = :approveStatus',
            { approveStatus: EBookingStatus.APPROVED },
          ),
      )
      .loadRelationCountAndMap(
        'eventParticipants.bookingParticipant',
        'event.eventParticipants',
        'bookingParticipant',
        (qb) =>
          qb.andWhere(
            'bookingParticipant.isDeleted = false AND bookingParticipant.bookingStatus = :bookingStatus',
            { bookingStatus: EBookingStatus.BOOKING },
          ),
      )
      .loadRelationCountAndMap(
        'eventParticipants.checkInParticipant',
        'event.eventParticipants',
        'checkInParticipant',
        (qb) =>
          qb.andWhere(
            "checkInParticipant.isDeleted = false AND checkInParticipant.bookingStatus = 'APPROVED' AND checkInParticipant.checkInAt IS NOT NULL",
          ),
      )
      .skip(skip)
      .take(take);

    if (name) {
      queryBuilder.andWhere('event.name ILIKE :name', { name: `%${name}%` });
    }

    if (isFreeOpen) {
      queryBuilder.andWhere('event.isFreeOpen = :isFreeOpen', { isFreeOpen });
    }

    if (upcoming) {
      queryBuilder.andWhere('event.startDateEvent > :now', {
        now: new Date(),
      });
      queryBuilder.addOrderBy('event.startDateEvent', 'ASC');
    } else if (onGoing) {
      queryBuilder.andWhere('event.startDateEvent <= :now', {
        now: new Date(),
      });
      queryBuilder.andWhere('event.endDateEvent >= :now', {
        now: new Date(),
      });
      queryBuilder.addOrderBy('event.startDateEvent', 'DESC');
    } else if (ended) {
      queryBuilder.andWhere('event.endDateEvent < :now', {
        now: new Date(),
      });
      queryBuilder.addOrderBy('event.endDateEvent', 'DESC');
    } else if (!(orderBy && orderBy.length)) {
      queryBuilder.addOrderBy('event.createdAt', 'DESC');
      // TODO add priority
      // queryBuilder.addOrderBy('event.priority', 'DESC');
    }

    if (orderBy && orderBy.length) {
      orderBy.forEach((order) => {
        if (order.column === 'bookingParticipant') {
          queryBuilder.addSelect((subQuery) => {
            return subQuery
              .select(
                'COUNT(eventParticipantCount.id)',
                'bookingParticipantSortable',
              )
              .from(EventParticipant, 'eventParticipantCount')
              .where(
                "eventParticipantCount.event = event.id AND eventParticipantCount.bookingStatus = 'BOOKING' AND eventParticipantCount.isDeleted = false",
              );
            // Use lower case in Postgres.
            // Postgres folds identifiers to lowercase, unless you double-quote your identifiers.
            // To make Postgres operations easier, use lower_snake
          }, 'booking_participant_sortable');
          queryBuilder.addOrderBy(
            'booking_participant_sortable',
            order.sortOrder,
          );
        } else if (order.column === 'currentParticipant') {
          queryBuilder.addSelect((subQuery) => {
            return subQuery
              .select(
                'COUNT(eventParticipantCount.id)',
                'currentParticipantSortable',
              )
              .from(EventParticipant, 'eventParticipantCount')
              .where(
                "eventParticipantCount.event = event.id AND eventParticipantCount.bookingStatus = 'APPROVED' AND eventParticipantCount.isDeleted = false",
              );
          }, 'current_participant_sortable');
          queryBuilder.addOrderBy(
            'current_participant_sortable',
            order.sortOrder,
          );
        } else if (order.column === 'checkInParticipant') {
          queryBuilder.addSelect((subQuery) => {
            return subQuery
              .select(
                'COUNT(eventParticipantCount.id)',
                'checkInParticipantSortable',
              )
              .from(EventParticipant, 'eventParticipantCount')
              .where(
                "eventParticipantCount.event = event.id AND eventParticipantCount.bookingStatus = 'APPROVED' AND eventParticipantCount.isDeleted = false AND eventParticipantCount.checkInAt IS NOT NULL",
              );
          }, 'check_in_participant_sortable');
          queryBuilder.addOrderBy(
            'check_in_participant_sortable',
            order.sortOrder,
          );
        } else {
          // order by not add "" to alias, so use snake_case instead of camelCase
          queryBuilder.addOrderBy(`event.${order.column}`, order.sortOrder);
        }
      });
    }

    const [events, count] = await queryBuilder.getManyAndCount();

    return returnPagingData(events, count, args);
  }

  async getBookingEvents(userData: IUserData, args: GetBookingEventsArgs) {
    const { take, skip, bookingStatus, name, address, orderBy } = args;

    const query = this.eventRepository
      .createQueryBuilder('event')
      .where('event.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('eventParticipants.userId = :userId', { userId: userData.id })
      .andWhere('eventParticipants.isDeleted = :isDeleted', {
        isDeleted: false,
      })
      .leftJoinAndSelect('event.eventParticipants', 'eventParticipants')
      .leftJoinAndSelect('eventParticipants.approver', 'approver')
      .leftJoinAndSelect('approver.userDetail', 'approverDetail')
      .skip(skip)
      .take(take);

    if (bookingStatus) {
      query.andWhere('eventParticipants.bookingStatus = :bookingStatus', {
        bookingStatus,
      });
    }

    if (name) {
      query.andWhere('event.name ILIKE :name', { name: `%${name}%` });
    }

    if (address) {
      query.andWhere('event.address ILIKE :address', {
        address: `%${address}%`,
      });
    }

    if (orderBy && orderBy.length) {
      orderBy.forEach((order) => {
        query.addOrderBy(`event.${order.column}`, order.sortOrder);
      });
    }

    const [data, count] = await query.getManyAndCount();

    return returnPagingData(data, count, args);
  }

  async createEvent(userData: IUserData, createEventInput: VCreateEventInput) {
    const { id: userId, tid: templeIds } = userData;
    const { roles, images, isFreeOpen } = createEventInput;

    const newEvent: DeepPartial<Event> = {
      name: createEventInput.name,
      description: createEventInput.description,
      startDateEvent: createEventInput.startDateEvent,
      endDateEvent: createEventInput.endDateEvent,
      address: createEventInput.address,
      phone: createEventInput.phone,
      email: createEventInput.email,
      creatorId: userId,
      templeId: templeIds[0],
      avatar: createEventInput.avatar,
      isFreeOpen: !!isFreeOpen,
      ...(!isFreeOpen && {
        maxParticipant: createEventInput.maxParticipant,
        startDateBooking: createEventInput.startDateBooking,
        endDateBooking: createEventInput.endDateBooking,
      }),
    };

    return await this.dataSource.transaction(
      async (entityManager: EntityManager) => {
        const createdEvent = await entityManager
          .getRepository(Event)
          .save(newEvent);
        if (roles && roles.length > 0) {
          const participantTypes = roles.map((role) => {
            return {
              eventId: createdEvent.id,
              role,
            };
          });

          await this.eventParticipantTypeService.createParticipantTypes(
            participantTypes,
            entityManager,
          );
        }

        if (images && images.length > 0) {
          await this.imageService.createImages(
            images.map((image) => {
              return {
                image,
                eventId: createdEvent.id,
              };
            }),
            entityManager,
          );
        }

        await this.queueProcessorService.handleAddQueue(
          QUEUE_MODULE_OPTIONS.SEND_MAIL_EVENT.NAME,
          QUEUE_MODULE_OPTIONS.SEND_MAIL_EVENT.JOBS.SEND_CREATE_EVENT_MAIL,
          {
            templeId: templeIds[0],
            startDateEvent: createEventInput.startDateEvent,
            eventAddress: createEventInput.address,
            eventName: createEventInput.name,
            eventPhone: createEventInput.phone,
            eventEmail: createEventInput.email,
            eventId: createdEvent.id,
          },
        );

        return createdEvent;
      },
    );
  }

  async getEventById(id: number) {
    return await this.eventRepository.findOne({
      where: { id, isDeleted: false },
    });
  }

  async getEventAndParticipantById(id: number) {
    return await this.eventRepository
      .createQueryBuilder('event')
      .where('event.id = :id', { id })
      .andWhere('event.isDeleted = :isDeleted', { isDeleted: false })
      .leftJoinAndSelect(
        'event.eventParticipants',
        'eventParticipants',
        'eventParticipants.isDeleted = false AND eventParticipants.bookingStatus = :approveStatus',
        { approveStatus: EBookingStatus.APPROVED },
      )
      .getOne();
  }

  async getEventDetailById(id: number, userData?: IUserData) {
    const currentParticipant =
      await this.eventParticipantService.getCurrentParticipantsByEventId(id);

    const eventData = await this.eventRepository
      .createQueryBuilder('event')
      .where('event.id = :id', { id })
      .andWhere('event.isDeleted = :isDeleted', { isDeleted: false })
      .leftJoinAndSelect(
        'event.eventParticipantTypes',
        'eventParticipantTypes',
        'eventParticipantTypes.isDeleted = :isDeleted',
        {
          isDeleted: false,
        },
      )
      .leftJoinAndSelect(
        'event.eventParticipants',
        'eventParticipants',
        `eventParticipants.isDeleted = false ${
          userData && userData.id
            ? 'AND eventParticipants.userId = ' + userData.id
            : ''
        }`,
      )
      .leftJoinAndSelect('event.images', 'images')
      .getOne();

    return {
      ...eventData,
      currentParticipant,
      isBooked:
        !!userData &&
        userData.id &&
        eventData?.eventParticipants &&
        eventData.eventParticipants.some(
          (participant) => participant.userId === userData.id,
        ),
    };
  }

  async updateEvent(updateEventInput: VUpdateEventInput, userData: IUserData) {
    const { id, roles, images, ...updateEventData } = updateEventInput;

    return await this.dataSource.transaction(
      async (entityManager: EntityManager) => {
        const eventRepository = entityManager.getRepository(Event);

        const event = await eventRepository.findOne({
          where: { id, isDeleted: false },
        });

        if (event.templeId !== userData.tid[0]) {
          throw new HttpException(
            ErrorMessage.UNAUTHORIZED,
            HttpStatus.UNAUTHORIZED,
          );
        }

        if (
          updateEventInput.isDeleted &&
          new Date(event.startDateEvent) < new Date()
        ) {
          throw new HttpException(
            ErrorMessage.INVALID_PARAM,
            HttpStatus.BAD_REQUEST,
          );
        }

        if (roles && roles.length) {
          await this.eventParticipantTypeService.updateParticipantTypeByEventId(
            id,
            roles.map((role) => {
              return {
                eventId: id,
                role,
              };
            }),
            entityManager,
          );
        } else {
          await this.eventParticipantTypeService.deleteParticipantTypeByEventId(
            id,
            entityManager,
          );
        }

        if (images && images.length > 0) {
          await this.imageService.updateImageByEventId(
            id,
            images.map((image) => {
              return {
                image,
                eventId: id,
              };
            }),
            entityManager,
          );
        }

        await this.queueProcessorService.handleAddQueue(
          QUEUE_MODULE_OPTIONS.SEND_MAIL_EVENT.NAME,
          updateEventInput.isDeleted &&
            new Date(event.startDateEvent) > new Date()
            ? QUEUE_MODULE_OPTIONS.SEND_MAIL_EVENT.JOBS.SEND_CANCEL_EVENT_MAIL
            : QUEUE_MODULE_OPTIONS.SEND_MAIL_EVENT.JOBS.SEND_UPDATE_EVENT_MAIL,
          {
            templeId: userData.tid[0],
            eventName: updateEventInput.name ?? event.name,
            eventPhone: updateEventInput.phone ?? event.phone,
            eventEmail: updateEventInput.email ?? event.email,
            eventId: id,
          },
        );
        return await eventRepository.update(
          {
            id,
          },
          updateEventData,
        );
      },
    );
  }
}
