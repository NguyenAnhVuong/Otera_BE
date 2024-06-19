import { Resolver } from '@nestjs/graphql';
import { DeathAnniversaryOfferingService } from './death-anniversary-offering.service';

@Resolver()
export class DeathAnniversaryOfferingResolver {
  constructor(
    private readonly deathAnniversaryOfferingService: DeathAnniversaryOfferingService,
  ) {}
}
