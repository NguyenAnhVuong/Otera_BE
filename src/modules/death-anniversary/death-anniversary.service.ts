import { Injectable } from '@nestjs/common';
import { CreateDeathAnniversaryInput } from './dto/create-death-anniversary.input';
import { IUserData } from '@core/interface/default.interface';
import { DeceasedService } from '@modules/deceased/deceased.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { DeathAnniversary } from '@core/database/entity/deathAnniversary.entity';

@Injectable()
export class DeathAnniversaryService {
  constructor(
    private readonly deceasedService: DeceasedService,
    @InjectRepository(DeathAnniversary)
    private readonly deathAnniversaryRepository: Repository<DeathAnniversary>,
  ) {}

  async createDeathAnniversary(
    createDeathAnniversaryInput: CreateDeathAnniversaryInput,
    userData: IUserData,
  ) {
    const { fid: familyId, id: creatorId } = userData;
    const { deceasedId } = createDeathAnniversaryInput;

    const { templeId } = await this.deceasedService.checkDeceasedInFamily(
      deceasedId,
      familyId,
    );

    const newDeathAnniversary: DeepPartial<DeathAnniversary> = {
      ...createDeathAnniversaryInput,
      templeId,
      creatorId,
    };

    return await this.deathAnniversaryRepository.save(newDeathAnniversary);
  }
}
