import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeepPartial, EntityManager, Repository } from 'typeorm';
import { VCreateEventInput } from './dto/create-event.input';
import { IUserData } from '@core/interface/default.interface';
import { Event } from '@core/database/entity/event.entity';
import { EventParticipantTypeService } from '@modules/event-participant-type/event-participant-type.service';
import { ImageService } from '@modules/image/image.service';
import { VUpdateEventInput } from './dto/update-event.input';
import { TempleGetEventArgs } from './dto/temple-get-event.args';
import { returnPagingData } from '@helper/utils';
import { ErrorMessage } from '@core/enum';
import { GetEventArgs } from './dto/get-event.args';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    private readonly eventParticipantTypeService: EventParticipantTypeService,

    private readonly imageService: ImageService,

    private readonly dataSource: DataSource,
  ) {}

  async getEvents(userData: IUserData, args: GetEventArgs) {
    const { templeId, upcoming, take, skip } = args;

    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .where('event.isDeleted = :isDeleted', { isDeleted: false })
      .skip(skip)
      .take(take)
      .orderBy('event.priority', 'DESC');
    if (templeId) {
      queryBuilder.andWhere('event.templeId = :templeId', { templeId });
    }

    if (upcoming) {
      queryBuilder.addOrderBy('event.startDateEvent', 'ASC');
      queryBuilder.andWhere('event.startDateEvent > :now', {
        now: new Date(),
      });
    }

    if (userData) {
      queryBuilder.addOrderBy(`ABS(event.id - ${userData.tid})`, 'ASC');
    }

    const [events, count] = await queryBuilder.getManyAndCount();

    return returnPagingData(events, count, args);
  }

  async templeGetEvents(userData: IUserData, args: TempleGetEventArgs) {
    const { tid: templeId } = userData;
    const { upcoming, ended, priority, take, skip } = args;

    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .where('event.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('event.templeId = :templeId', { templeId })
      .skip(skip)
      .take(take)
      .orderBy('event.createdAt', 'DESC');
    if (upcoming) {
      queryBuilder.andWhere('event.startDateEvent > :now', {
        now: new Date(),
      });
      queryBuilder.addOrderBy('event.startDateEvent', 'ASC');
    }

    if (ended) {
      queryBuilder.andWhere('event.endDateEvent < :now', {
        now: new Date(),
      });
      queryBuilder.addOrderBy('event.endDateEvent', 'ASC');
    }

    if (priority) {
      queryBuilder.addOrderBy('event.priority', 'DESC');
    }

    const [events, count] = await queryBuilder.getManyAndCount();

    return returnPagingData(events, count, args);
  }

  async createEvent(userData: IUserData, createEventInput: VCreateEventInput) {
    const { id: userId, tid: templeId } = userData;
    const { roles, images } = createEventInput;

    const newEvent: DeepPartial<Event> = {
      name: createEventInput.name,
      description: createEventInput.description,
      startDateEvent: createEventInput.startDateEvent,
      endDateEvent: createEventInput.endDateEvent,
      startDateBooking: createEventInput.startDateBooking,
      endDateBooking: createEventInput.endDateBooking,
      address: createEventInput.address,
      phone: createEventInput.phone,
      email: createEventInput.email,
      maxParticipant: createEventInput.maxParticipant,
      creatorId: userId,
      templeId,
      avatar: createEventInput.avatar,
    };

    return this.dataSource.transaction(async (entityManager: EntityManager) => {
      const createdEvent = await entityManager
        .getRepository(Event)
        .save(newEvent);

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
      return createdEvent;
    });
  }

  async getEventById(id: number, entityManager?: EntityManager) {
    const eventRepository = entityManager
      ? entityManager.getRepository(Event)
      : this.eventRepository;
    return await eventRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['eventParticipantTypes', 'eventParticipants', 'images'],
    });
  }

  async updateEvent(updateEventInput: VUpdateEventInput, userData: IUserData) {
    const { id, roles, images, ...updateEventData } = updateEventInput;

    return await this.dataSource.transaction(
      async (entityManager: EntityManager) => {
        const eventRepository = entityManager.getRepository(Event);

        const event = await eventRepository.findOne({
          where: { id, isDeleted: false },
        });

        if (event.templeId !== userData.tid) {
          throw new HttpException(
            ErrorMessage.UNAUTHORIZED,
            HttpStatus.UNAUTHORIZED,
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
