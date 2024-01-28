import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FamilyTemple } from 'src/core/database/entity/familyTemple.entity';
import { DeepPartial, EntityManager, Repository } from 'typeorm';

@Injectable()
export class FamilyTempleService {
  constructor(
    @InjectRepository(FamilyTemple)
    private familyTempleRepository: Repository<FamilyTemple>,
  ) {}

  async checkFamilyInTemple(familyId: number, templeId: number) {
    return await this.familyTempleRepository.findOne({
      where: {
        familyId,
        templeId,
      },
    });
  }

  async createFamilyTemple(
    familyTempleParams: DeepPartial<FamilyTemple>,
    entityManager?: EntityManager,
  ): Promise<FamilyTemple> {
    const familyTempleRepository = entityManager
      ? entityManager.getRepository(FamilyTemple)
      : this.familyTempleRepository;
    return await familyTempleRepository.save(familyTempleParams);
  }
}
