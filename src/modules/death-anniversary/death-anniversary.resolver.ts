import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DeathAnniversaryService } from './death-anniversary.service';
import { CreateDeathAnniversaryInput } from './dto/create-death-anniversary.input';

import { DeathAnniversary } from '@core/database/entity/deathAnniversary.entity';
import { GraphQLRoles } from '@core/decorator/graphQLRoles.decorator';
import { GraphQLUserData } from '@core/decorator/graphQLUser.decorator';
import { ERole } from '@core/enum';
import { IUserData } from '@core/interface/default.interface';
import { GetDeathAnniversariesInput } from './dto/death-anniversary.input';
import { DeathAnniversariesRes } from './entities/death-anniversaries-res.entity';
import { DeathAnniversaryRes } from './entities/death-anniversary-res.entity';
import { UpdateStatusDeathAnniversaryInput } from './dto/update-status-death-anniversary.input';
import { GraphQLResponse } from '@core/global/entities/graphQLRes.entity';

@Resolver(() => DeathAnniversary)
export class DeathAnniversaryResolver {
  constructor(
    private readonly deathAnniversaryService: DeathAnniversaryService,
  ) {}

  @GraphQLRoles([ERole.FAMILY_ADMIN, ERole.FAMILY_MEMBER])
  @Mutation(() => DeathAnniversaryRes, { name: 'createDeathAnniversary' })
  createDeathAnniversary(
    @Args('createDeathAnniversaryInput')
    createDeathAnniversaryInput: CreateDeathAnniversaryInput,
    @GraphQLUserData() userData: IUserData,
  ) {
    return this.deathAnniversaryService.createDeathAnniversary(
      createDeathAnniversaryInput,
      userData,
    );
  }

  @GraphQLRoles([ERole.TEMPLE_ADMIN, ERole.FAMILY_ADMIN, ERole.FAMILY_MEMBER])
  @Query(() => DeathAnniversariesRes, { name: 'getDeathAnniversaries' })
  getDeathAnniversaries(
    @Args('getDeathAnniversariesInput')
    getDeathAnniversariesInput: GetDeathAnniversariesInput,
    @GraphQLUserData() userData: IUserData,
  ) {
    return this.deathAnniversaryService.getDeathAnniversaries(
      getDeathAnniversariesInput,
      userData,
    );
  }

  @GraphQLRoles([ERole.TEMPLE_ADMIN])
  @Mutation(() => GraphQLResponse, { name: 'updateStatusDeathAnniversary' })
  updateStatusDeathAnniversary(
    @Args('updateStatusDeathAnniversaryInput')
    updateStatusDeathAnniversaryInput: UpdateStatusDeathAnniversaryInput,
  ) {
    return this.deathAnniversaryService.updateStatusDeathAnniversary(
      updateStatusDeathAnniversaryInput,
    );
  }
}
