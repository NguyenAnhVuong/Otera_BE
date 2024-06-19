import { DeathAnniversary } from '@core/database/entity/deathAnniversary.entity';
import { EDeathAnniversaryStatus, EStatus, ErrorMessage } from '@core/enum';
import { IUserData } from '@core/interface/default.interface';
import { DeceasedService } from '@modules/deceased/deceased.service';
import { TempleService } from '@modules/temple/temple.service';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  DeepPartial,
  EntityManager,
  LessThan,
  MoreThan,
  Repository,
} from 'typeorm';
import { CreateDeathAnniversaryInput } from './dto/create-death-anniversary.input';
import { GetDeathAnniversariesInput } from './dto/get-death-anniversaries.input';
import { QueueProcessorService } from '@core/global/queueProcessor/quequeProcessor.service';
import { QUEUE_MODULE_OPTIONS } from '@core/global/queueProcessor/queueIdentity.constant';
import { DeathAnniversaryOfferingService } from '@modules/death-anniversary-offering/death-anniversary-offering.service';
import { UpdateDeathAnniversaryInput } from './dto/update-death-anniversary.input';

@Injectable()
export class DeathAnniversaryService {
  constructor(
    @Inject(forwardRef(() => DeceasedService))
    private readonly deceasedService: DeceasedService,

    @InjectRepository(DeathAnniversary)
    private readonly deathAnniversaryRepository: Repository<DeathAnniversary>,

    private readonly deathAnniversaryOfferingService: DeathAnniversaryOfferingService,

    private readonly queueProcessService: QueueProcessorService,

    private readonly dataSource: DataSource,

    private readonly templeService: TempleService,
  ) {}

  async checkIsExistedDeathAnniversary(deceasedId: number) {
    const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1);
    const lastDayOfYear = new Date(new Date().getFullYear(), 11, 31);
    const deathAnniversary = await this.deathAnniversaryRepository
      .createQueryBuilder('deathAnniversary')
      .where('deathAnniversary.deceasedId = :deceasedId', { deceasedId })
      .andWhere('deathAnniversary.isDeleted = false')
      .andWhere('deathAnniversary.status IN (:...status)', {
        status: [EStatus.PENDING, EStatus.APPROVED],
      })
      .andWhere('deathAnniversary.desiredStartTime >= :firstDayOfYear', {
        firstDayOfYear,
      })
      .andWhere('deathAnniversary.desiredStartTime <= :lastDayOfYear', {
        lastDayOfYear,
      })
      .getOne();

    return !!deathAnniversary;
  }

  async createDeathAnniversary(
    createDeathAnniversaryInput: CreateDeathAnniversaryInput,
    userData: IUserData,
  ) {
    const { fid: familyId, id: creatorId, name: requesterName } = userData;
    const { deceasedId } = createDeathAnniversaryInput;

    const {
      templeId,
      userDetail: { name },
    } = await this.deceasedService.checkDeceasedInFamily(deceasedId, familyId);

    // const isExistedDeathAnniversary = await this.checkIsExistedDeathAnniversary(
    //   deceasedId,
    // );

    // if (isExistedDeathAnniversary) {
    //   throw new HttpException(
    //     ErrorMessage.DEATH_ANNIVERSARY_REQUEST_EXIST,
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }

    const newDeathAnniversary: DeepPartial<DeathAnniversary> = {
      ...createDeathAnniversaryInput,
      templeId,
      creatorId,
      familyId,
    };

    return await this.dataSource.transaction(async (entityManager) => {
      const deathAnniversaryRepository =
        entityManager.getRepository(DeathAnniversary);

      await this.queueProcessService.handleAddQueue(
        QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.NAME,
        QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.JOBS
          .SEND_REQUEST_DEATH_ANNIVERSARY,
        {
          templeId,
          requesterName,
          deceasedName: name,
        },
      );

      const deathAnniversary = await deathAnniversaryRepository.save(
        newDeathAnniversary,
      );

      await this.deathAnniversaryOfferingService.createDeathAnniversaryOfferings(
        createDeathAnniversaryInput.offeringIds.map((offeringId) => ({
          deathAnniversaryId: deathAnniversary.id,
          offeringId,
        })),
        entityManager,
      );

      return true;
    });
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
        ...(isPending && { status: EDeathAnniversaryStatus.PENDING }),
        deceased: { isDeleted: false },
      },
      relations: [
        'deceased',
        'deceased.userDetail',
        'deathAnniversaryOfferings',
      ],
    });
  }

  async familyUpdateDeathAnniversary(
    updateDeathAnniversaryInput: UpdateDeathAnniversaryInput,
  ) {
    const { id, offeringIds, ...newDeathAnniversaryData } =
      updateDeathAnniversaryInput;
    await this.dataSource.transaction(async (entityManager) => {
      const deathAnniversaryRepository =
        entityManager.getRepository(DeathAnniversary);

      if (offeringIds && offeringIds.length) {
        await this.deathAnniversaryOfferingService.deleteDeathAnniversaryOfferingsByDeathAnniversaryId(
          id,
          entityManager,
        );

        await this.deathAnniversaryOfferingService.createDeathAnniversaryOfferings(
          offeringIds.map((offeringId) => ({
            deathAnniversaryId: id,
            offeringId,
          })),
          entityManager,
        );
      }

      return await deathAnniversaryRepository.update(
        { id },
        newDeathAnniversaryData,
      );
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

  async deleteDeathAnniversaryByDeceasedId(
    deceasedId: number,
    entityManager?: EntityManager,
  ) {
    const deathAnniversaryRepository = entityManager
      ? entityManager.getRepository(DeathAnniversary)
      : this.deathAnniversaryRepository;
    return await deathAnniversaryRepository.update(
      { deceasedId },
      { isDeleted: true },
    );
  }
}
