import { DeathAnniversary } from '@core/database/entity/deathAnniversary.entity';
import { EStatus } from '@core/enum';
import { IUserData } from '@core/interface/default.interface';
import { DeceasedService } from '@modules/deceased/deceased.service';
import { TempleService } from '@modules/temple/temple.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, LessThan, MoreThan, Repository } from 'typeorm';
import { CreateDeathAnniversaryInput } from './dto/create-death-anniversary.input';
import { GetDeathAnniversariesInput } from './dto/get-death-anniversaries.input';

@Injectable()
export class DeathAnniversaryService {
  constructor(
    private readonly deceasedService: DeceasedService,
    @InjectRepository(DeathAnniversary)
    private readonly deathAnniversaryRepository: Repository<DeathAnniversary>,
    private readonly templeService: TempleService,
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
      familyId,
    };

    return await this.deathAnniversaryRepository.save(newDeathAnniversary);
  }

  async getDeathAnniversaries(
    deathAnniversaryQuery: GetDeathAnniversariesInput,
    userData: IUserData,
  ) {
    const { isEnd, isStart, isPending } = deathAnniversaryQuery;
    const { id: adminId, fid: familyId } = userData;
    const temple = await this.templeService.getTempleById(adminId);
    return await this.deathAnniversaryRepository.find({
      where: {
        isDeleted: false,
        ...(familyId ? { familyId } : { templeId: temple.id }),
        ...(isEnd && {
          actualEndTime: LessThan(new Date()),
        }),
        ...(isStart && {
          actualStartTime: LessThan(new Date()),
          actualEndTime: MoreThan(new Date()),
        }),
        ...(isPending && { status: EStatus.PENDING }),
      },
      relations: ['deceased', 'deceased.userDetail'],
    });
  }

  async updateStatusDeathAnniversary(
    updateStatusDeathAnniversaryInput: DeepPartial<DeathAnniversary>,
  ) {
    const { id, ...newDeathAnniversaryData } =
      updateStatusDeathAnniversaryInput;
    return await this.deathAnniversaryRepository.update(
      { id },
      newDeathAnniversaryData,
    );
  }

  async deleteDeathAnniversaryById(id: number) {
    return await this.deathAnniversaryRepository.update(
      { id },
      { isDeleted: true },
    );
  }
}
