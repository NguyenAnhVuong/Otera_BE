import { Args, Query, Resolver } from '@nestjs/graphql';
import { OfferingService } from './offering.service';

import { GQLRoles } from '@core/decorator/gqlRoles.decorator';
import { ERole } from '@core/enum';
import { GetOfferingsArgs } from './dto/get-offerings.args';
import { OfferingsRes } from './entities/offeringsRes.entity';

@Resolver()
export class OfferingResolver {
  constructor(private readonly offeringService: OfferingService) {}
  @GQLRoles([
    ERole.TEMPLE_ADMIN,
    ERole.TEMPLE_MEMBER,
    ERole.FAMILY_ADMIN,
    ERole.FAMILY_MEMBER,
  ])
  @Query(() => OfferingsRes, { name: 'getOfferings' })
  getOfferings(@Args() getOfferingsArgs: GetOfferingsArgs) {
    return this.offeringService.getOfferings(getOfferingsArgs);
  }
}
