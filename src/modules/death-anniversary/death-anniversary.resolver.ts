import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DeathAnniversaryService } from './death-anniversary.service';
import { CreateDeathAnniversaryInput } from './dto/create-death-anniversary.input';

import { DeathAnniversary } from '@core/database/entity/deathAnniversary.entity';
import { GQLRoles } from '@core/decorator/gqlRoles.decorator';
import { GQLUserData } from '@core/decorator/gqlUser.decorator';
import { ERole } from '@core/enum';
import { CreateRes } from '@core/global/entities/createRes.entity';
import { GQLResponse } from '@core/global/entities/gqlRes.entity';
import { IUserData } from '@core/interface/default.interface';
import { HttpStatus, ParseIntPipe } from '@nestjs/common';
import { CancelDeathAnniversaryInput } from './dto/cancel-death-anniversary.input';
import { VFamilyGetDeathAnniversariesInput } from './dto/family-get-death-anniversaries.args';
import { TempleUpdateDeathAnniversaryInput } from './dto/temple-update-death-anniversary.input';
import { UpdateDeathAnniversaryInput } from './dto/update-death-anniversary.input';
import { DeathAnniversariesRes } from './entities/death-anniversaries-res.entity';
import { DeathAnniversaryRes } from './entities/death-anniversary-res.entity';
import { GQLArgsPaging } from '@core/decorator/gqlArgsPaging.decorator';
import { VTempleGetDeathAnniversariesInput } from './dto/temple-get-death-anniversaries.args';

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

  @GQLRoles([ERole.FAMILY_ADMIN, ERole.FAMILY_MEMBER])
  @Query(() => DeathAnniversariesRes, { name: 'familyGetDeathAnniversaries' })
  familyGetDeathAnniversaries(
    @GQLArgsPaging()
    @Args()
    getDeathAnniversariesInput: VFamilyGetDeathAnniversariesInput,
    @GQLUserData() userData: IUserData,
  ) {
    return this.deathAnniversaryService.familyGetDeathAnniversaries(
      getDeathAnniversariesInput,
      userData,
    );
  }

  @GQLRoles([ERole.TEMPLE_ADMIN, ERole.TEMPLE_MEMBER])
  @Query(() => DeathAnniversariesRes, { name: 'templeGetDeathAnniversaries' })
  templeGetDeathAnniversaries(
    @GQLArgsPaging()
    @Args()
    getDeathAnniversariesInput: VTempleGetDeathAnniversariesInput,
    @GQLUserData() userData: IUserData,
  ) {
    return this.deathAnniversaryService.templeGetDeathAnniversaries(
      getDeathAnniversariesInput,
      userData,
    );
  }

  @GQLRoles([ERole.TEMPLE_ADMIN, ERole.TEMPLE_MEMBER])
  @Mutation(() => GQLResponse, { name: 'templeUpdateDeathAnniversary' })
  templeUpdateDeathAnniversary(
    @GQLUserData() userData: IUserData,
    @Args('templeUpdateDeathAnniversaryInput')
    templeUpdateDeathAnniversaryInput: TempleUpdateDeathAnniversaryInput,
  ) {
    return this.deathAnniversaryService.updateStatusDeathAnniversary(
      userData,
      templeUpdateDeathAnniversaryInput,
    );
  }

  @GQLRoles([ERole.FAMILY_ADMIN, ERole.FAMILY_MEMBER])
  @Mutation(() => GQLResponse, { name: 'familyUpdateDeathAnniversary' })
  familyUpdateDeathAnniversary(
    @Args('updateDeathAnniversaryInput')
    updateDeathAnniversaryInput: UpdateDeathAnniversaryInput,
  ) {
    return this.deathAnniversaryService.familyUpdateDeathAnniversary(
      updateDeathAnniversaryInput,
    );
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

  @GQLRoles([ERole.FAMILY_ADMIN, ERole.FAMILY_MEMBER])
  @Query(() => CreateRes, { name: 'checkIsExistedRequestDeathAnniversary' })
  checkIsExistedRequestDeathAnniversary(
    @Args(
      'deceasedId',
      { type: () => Int },
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    deceasedId: number,
  ) {
    return this.deathAnniversaryService.checkIsExistedDeathAnniversary(
      deceasedId,
    );
  }
}
