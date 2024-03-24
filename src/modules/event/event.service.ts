import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeepPartial, EntityManager, Repository } from 'typeorm';
import { VCreateEventInput } from './dto/create-event.input';
import { IUserData } from '@core/interface/default.interface';
import { Event } from '@core/database/entity/event.entity';
import { EventParticipantTypeService } from '@modules/event-participant-type/event-participant-type.service';
import { ImageService } from '@modules/image/image.service';
import { VUpdateEventInput } from './dto/update-event.input';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    private readonly eventParticipantTypeService: EventParticipantTypeService,

    private readonly imageService: ImageService,

    private readonly dataSource: DataSource,
  ) {}

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
    console.log('newEvent', newEvent);
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

    return eventRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['eventParticipantTypes', 'eventParticipants'],
    });
  }

  async updateEvent(updateEventInput: VUpdateEventInput) {
    const { id, roles, images, ...updateEventData } = updateEventInput;

    return await this.dataSource.transaction(
      async (entityManager: EntityManager) => {
        const eventRepository = entityManager.getRepository(Event);

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
