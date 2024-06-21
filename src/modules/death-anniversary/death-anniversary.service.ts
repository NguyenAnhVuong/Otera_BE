import { DeathAnniversary } from '@core/database/entity/deathAnniversary.entity';
import { EDeathAnniversaryStatus, EStatus } from '@core/enum';
import { QueueProcessorService } from '@core/global/queueProcessor/quequeProcessor.service';
import { QUEUE_MODULE_OPTIONS } from '@core/global/queueProcessor/queueIdentity.constant';
import { IUserData } from '@core/interface/default.interface';
import { returnPagingData } from '@helper/utils';
import { DeathAnniversaryOfferingService } from '@modules/death-anniversary-offering/death-anniversary-offering.service';
import { DeceasedService } from '@modules/deceased/deceased.service';
import { TempleService } from '@modules/temple/temple.service';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeepPartial, EntityManager, Repository } from 'typeorm';
import { CreateDeathAnniversaryInput } from './dto/create-death-anniversary.input';
import { VFamilyGetDeathAnniversariesInput } from './dto/family-get-death-anniversaries.args';
import { TempleUpdateDeathAnniversaryInput } from './dto/temple-update-death-anniversary.input';
import { UpdateDeathAnniversaryInput } from './dto/update-death-anniversary.input';
import { VTempleGetDeathAnniversariesInput } from './dto/temple-get-death-anniversaries.args';

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
          familyId,
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

  async familyGetDeathAnniversaries(
    deathAnniversaryQuery: VFamilyGetDeathAnniversariesInput,
    userData: IUserData,
  ) {
    const {
      name,
      status,
      tombAddress,
      requesterName,
      deathAnniversaryTypes,
      orderBy,
      skip,
      take,
    } = deathAnniversaryQuery;
    const { fid: familyId } = userData;

    const query = this.deathAnniversaryRepository
      .createQueryBuilder('deathAnniversary')
      .where('deathAnniversary.isDeleted = false')
      .andWhere('deceased.isDeleted = false')
      .andWhere('deathAnniversary.familyId = :familyId', { familyId })
      .leftJoinAndSelect('deathAnniversary.deceased', 'deceased')
      .leftJoinAndSelect('deceased.userDetail', 'userDetail')
      .leftJoinAndSelect(
        'deathAnniversary.deathAnniversaryOfferings',
        'deathAnniversaryOfferings',
      )
      .leftJoinAndSelect('deathAnniversaryOfferings.offering', 'offering')
      .leftJoinAndSelect('deathAnniversary.temple', 'temple')
      .leftJoinAndSelect('deathAnniversary.user', 'requester')
      .leftJoinAndSelect('requester.userDetail', 'requesterDetail')
      .skip(skip)
      .take(take)
      .orderBy('deathAnniversary.createdAt', 'DESC');

    if (status) {
      query.andWhere('deathAnniversary.status = :status', { status });
    }

    if (name) {
      query.andWhere('userDetail.name ILIKE :name', {
        name: `%${name}%`,
      });
    }

    if (tombAddress) {
      query.andWhere('deceased.tombAddress ILIKE :tombAddress', {
        tombAddress: `%${tombAddress}%`,
      });
    }

    if (requesterName) {
      query.andWhere('requesterDetail.name ILIKE :requesterName', {
        requesterName: `%${requesterName}%`,
      });
    }

    if (deathAnniversaryTypes && deathAnniversaryTypes.length) {
      query.andWhere(
        'deathAnniversary.deathAnniversaryType IN (:...deathAnniversaryTypes)',
        { deathAnniversaryTypes },
      );
    }

    if (orderBy && orderBy.length) {
      orderBy.forEach((order) => {
        query.addOrderBy(`deathAnniversary.${order.column}`, order.sortOrder);
      });
    }

    const [data, count] = await query.getManyAndCount();

    return returnPagingData(data, count, deathAnniversaryQuery);
  }

  async templeGetDeathAnniversaries(
    deathAnniversaryQuery: VTempleGetDeathAnniversariesInput,
    userData: IUserData,
  ) {
    const {
      name,
      status,
      tombAddress,
      requesterName,
      familyKeyword,
      deathAnniversaryTypes,
      orderBy,
      skip,
      take,
    } = deathAnniversaryQuery;
    const { tid } = userData;

    const query = this.deathAnniversaryRepository
      .createQueryBuilder('deathAnniversary')
      .where('deathAnniversary.isDeleted = false')
      .andWhere('deceased.isDeleted = false')
      .andWhere('deathAnniversary.templeId = :templeId', { templeId: tid[0] })
      .leftJoinAndSelect('deathAnniversary.deceased', 'deceased')
      .leftJoinAndSelect('deceased.userDetail', 'userDetail')
      .leftJoinAndSelect(
        'deathAnniversary.deathAnniversaryOfferings',
        'deathAnniversaryOfferings',
      )
      .leftJoinAndSelect('deathAnniversaryOfferings.offering', 'offering')
      .leftJoinAndSelect('deathAnniversary.temple', 'temple')
      .leftJoinAndSelect('deathAnniversary.user', 'requester')
      .leftJoinAndSelect('requester.userDetail', 'requesterDetail')
      .leftJoinAndSelect('deathAnniversary.family', 'family')
      .skip(skip)
      .take(take)
      .orderBy('deathAnniversary.createdAt', 'DESC');

    if (status) {
      query.andWhere('deathAnniversary.status = :status', { status });
    }

    if (name) {
      query.andWhere('userDetail.name ILIKE :name', {
        name: `%${name}%`,
      });
    }

    if (tombAddress) {
      query.andWhere('deceased.tombAddress ILIKE :tombAddress', {
        tombAddress: `%${tombAddress}%`,
      });
    }

    if (requesterName) {
      query.andWhere('requesterDetail.name ILIKE :requesterName', {
        requesterName: `%${requesterName}%`,
      });
    }

    if (deathAnniversaryTypes && deathAnniversaryTypes.length) {
      query.andWhere(
        'deathAnniversary.deathAnniversaryType IN (:...deathAnniversaryTypes)',
        { deathAnniversaryTypes },
      );
    }

    if (familyKeyword) {
      query.andWhere(
        'family.name ILIKE :familyKeyword OR family.familyCode ILIKE :familyKeyword',
        {
          familyKeyword: `%${familyKeyword}%`,
        },
      );
    }

    if (orderBy && orderBy.length) {
      orderBy.forEach((order) => {
        query.addOrderBy(`deathAnniversary.${order.column}`, order.sortOrder);
      });
    }

    const [data, count] = await query.getManyAndCount();

    return returnPagingData(data, count, deathAnniversaryQuery);
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

      // TODO send mail to temple if enableUpdate is true

      return await deathAnniversaryRepository.update(
        { id },
        { ...newDeathAnniversaryData, status: EDeathAnniversaryStatus.PENDING },
      );
    });
  }

  async updateStatusDeathAnniversary(
    userData: IUserData,
    templeUpdateDeathAnniversaryInput: TempleUpdateDeathAnniversaryInput,
  ) {
    const { id, ...newDeathAnniversaryData } =
      templeUpdateDeathAnniversaryInput;

    if (newDeathAnniversaryData.status === EDeathAnniversaryStatus.APPROVED) {
      this.queueProcessService.handleAddQueue(
        QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.NAME,
        QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.JOBS
          .TEMPLE_APPROVE_DEATH_ANNIVERSARY,
        {
          approverId: userData.id,
          deathAnniversaryId: id,
        },
      );
    } else if (
      newDeathAnniversaryData.status === EDeathAnniversaryStatus.REJECTED
    ) {
      this.queueProcessService.handleAddQueue(
        QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.NAME,
        QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.JOBS
          .TEMPLE_REJECT_DEATH_ANNIVERSARY,
        {
          approverId: userData.id,
          deathAnniversaryId: id,
        },
      );
    } else if (
      newDeathAnniversaryData.status === EDeathAnniversaryStatus.READY
    ) {
      this.queueProcessService.handleAddQueue(
        QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.NAME,
        QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.JOBS
          .TEMPLE_READY_DEATH_ANNIVERSARY,
        {
          approverId: userData.id,
          deathAnniversaryId: id,
        },
      );
    } else if (
      newDeathAnniversaryData.status === EDeathAnniversaryStatus.FINISHED
    ) {
      this.queueProcessService.handleAddQueue(
        QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.NAME,
        QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.JOBS
          .TEMPLE_FINISH_DEATH_ANNIVERSARY,
        {
          approverId: userData.id,
          deathAnniversaryId: id,
        },
      );
    }

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

  async getDeathAnniversaryById(id: number) {
    return await this.deathAnniversaryRepository.findOne({
      where: { id },
      relations: [
        'deceased',
        'deathAnniversaryOfferings',
        'deceased.userDetail',
      ],
    });
  }
}
