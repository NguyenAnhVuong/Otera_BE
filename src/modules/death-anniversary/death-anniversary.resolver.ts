import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DeathAnniversaryService } from './death-anniversary.service';
import { CreateDeathAnniversaryInput } from './dto/create-death-anniversary.input';

import { DeathAnniversary } from '@core/database/entity/deathAnniversary.entity';
import { GQLRoles } from '@core/decorator/gqlRoles.decorator';
import { GQLUserData } from '@core/decorator/gqlUser.decorator';
import { ERole, EStatus } from '@core/enum';
import { GQLResponse } from '@core/global/entities/gqlRes.entity';
import { IUserData } from '@core/interface/default.interface';
import { GetDeathAnniversariesInput } from './dto/get-death-anniversaries.input';
import { TempleUpdateDeathAnniversaryInput } from './dto/temple-update-death-anniversary.input';
import { UpdateDeathAnniversaryInput } from './dto/update-death-anniversary.input';
import { DeathAnniversariesRes } from './entities/death-anniversaries-res.entity';
import { DeathAnniversaryRes } from './entities/death-anniversary-res.entity';
import { CancelDeathAnniversaryInput } from './dto/cancel-death-anniversary.input';

@Resolver(() => DeathAnniversary)
export class DeathAnniversaryResolver {
  constructor(
    private readonly deathAnniversaryService: DeathAnniversaryService,
  ) {}

  @GQLRoles([ERole.FAMILY_ADMIN, ERole.FAMILY_MEMBER])
  @Mutation(() => DeathAnniversaryRes, { name: 'createDeathAnniversary' })
  createDeathAnniversary(
    @Args('createDeathAnniversaryInput')
    createDeathAnniversaryInput: CreateDeathAnniversaryInput,
    @GQLUserData() userData: IUserData,
  ) {
    return this.deathAnniversaryService.createDeathAnniversary(
      createDeathAnniversaryInput,
      userData,
    );
  }

  @GQLRoles([ERole.TEMPLE_ADMIN, ERole.FAMILY_ADMIN, ERole.FAMILY_MEMBER])
  @Query(() => DeathAnniversariesRes, { name: 'getDeathAnniversaries' })
  getDeathAnniversaries(
    @Args('getDeathAnniversariesInput')
    getDeathAnniversariesInput: GetDeathAnniversariesInput,
    @GQLUserData() userData: IUserData,
  ) {
    return this.deathAnniversaryService.getDeathAnniversaries(
      getDeathAnniversariesInput,
      userData,
    );
  }

  @GQLRoles([ERole.TEMPLE_ADMIN])
  @Mutation(() => GQLResponse, { name: 'templeUpdateDeathAnniversary' })
  templeUpdateDeathAnniversary(
    @Args('templeUpdateDeathAnniversaryInput')
    templeUpdateDeathAnniversaryInput: TempleUpdateDeathAnniversaryInput,
  ) {
    return this.deathAnniversaryService.updateStatusDeathAnniversary(
      templeUpdateDeathAnniversaryInput,
    );
  }

  @GQLRoles([ERole.FAMILY_ADMIN, ERole.FAMILY_MEMBER])
  @Mutation(() => GQLResponse, { name: 'familyUpdateDeathAnniversary' })
  familyUpdateDeathAnniversary(
    @Args('updateDeathAnniversaryInput')
    updateDeathAnniversaryInput: UpdateDeathAnniversaryInput,
  ) {
    return this.deathAnniversaryService.updateStatusDeathAnniversary({
      ...updateDeathAnniversaryInput,
      status: EStatus.PENDING,
    });
  }

  @GQLRoles([ERole.FAMILY_ADMIN, ERole.FAMILY_MEMBER])
  @Mutation(() => GQLResponse, { name: 'cancelDeathAnniversary' })
  cancelDeathAnniversary(
    @Args('cancelDeathAnniversaryInput')
    cancelDeathAnniversaryInput: CancelDeathAnniversaryInput,
  ) {
    return this.deathAnniversaryService.deleteDeathAnniversaryById(
      cancelDeathAnniversaryInput.id,
    );
  }
}
