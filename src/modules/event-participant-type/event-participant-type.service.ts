import { EventParticipantType } from '@core/database/entity/eventParticipantType.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeepPartial, EntityManager, Repository } from 'typeorm';

@Injectable()
export class EventParticipantTypeService {
  constructor(
    @InjectRepository(EventParticipantType)
    private readonly eventParticipantTypeRepository: Repository<EventParticipantType>,

    private readonly dataSource: DataSource,
  ) {}
  async createParticipantTypes(
    eventParticipantType: DeepPartial<EventParticipantType>[],
    entityManager?: EntityManager,
  ) {
    const eventParticipantTypeRepository = entityManager
      ? entityManager.getRepository(EventParticipantType)
      : this.eventParticipantTypeRepository;
    return await eventParticipantTypeRepository.save(eventParticipantType);
  }

  async updateParticipantTypeByEventId(
    eventId: number,
    eventParticipantType: DeepPartial<EventParticipantType>[],
    entityManager?: EntityManager,
  ) {
    const eventParticipantTypeRepository = entityManager
      ? entityManager.getRepository(EventParticipantType)
      : this.eventParticipantTypeRepository;

    await eventParticipantTypeRepository.delete({ eventId });
    await eventParticipantTypeRepository.save(eventParticipantType);
    return true;
  }
}
