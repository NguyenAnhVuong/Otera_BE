import { Offering } from '@core/database/entity/offering.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetOfferingsArgs } from './dto/get-offerings.args';
import { returnPagingData } from '@helper/utils';

@Injectable()
export class OfferingService {
  constructor(
    @InjectRepository(Offering)
    private readonly offeringRepository: Repository<Offering>,
  ) {}

  async getOfferings(getOfferingsArgs: GetOfferingsArgs) {
    const { skip, take } = getOfferingsArgs;
    const [data, count] = await this.offeringRepository.findAndCount({
      skip,
      take,
    });

    return returnPagingData(data, count, getOfferingsArgs);
  }
}
