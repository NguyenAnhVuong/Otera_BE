import { DeathAnniversaryOffering } from '@core/database/entity/deathAnniversaryOffering.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, EntityManager } from 'typeorm';

@Injectable()
export class DeathAnniversaryOfferingService {
  constructor(
    @InjectRepository(DeathAnniversaryOffering)
    private readonly deathAnniversaryOfferingRepository: Repository<DeathAnniversaryOffering>,
  ) {}

  async createDeathAnniversaryOfferings(
    deathAnniversaryOfferings: Array<DeepPartial<DeathAnniversaryOffering>>,
    entityManager: EntityManager,
  ): Promise<DeathAnniversaryOffering[]> {
    const deathAnniversaryOfferingRepository = entityManager
      ? entityManager.getRepository(DeathAnniversaryOffering)
      : this.deathAnniversaryOfferingRepository;
    return await deathAnniversaryOfferingRepository.save(
      deathAnniversaryOfferings,
    );
  }

  async deleteDeathAnniversaryOfferingsByDeathAnniversaryId(
    deathAnniversaryId: number,
    entityManager?: EntityManager,
  ) {
    const deathAnniversaryOfferingRepository = entityManager
      ? entityManager.getRepository(DeathAnniversaryOffering)
      : this.deathAnniversaryOfferingRepository;
    await deathAnniversaryOfferingRepository.delete({ deathAnniversaryId });
  }
}
