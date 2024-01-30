import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { DeathAnniversaryService } from './death-anniversary.service';
import { CreateDeathAnniversaryInput } from './dto/create-death-anniversary.input';

import { GraphQLUserData } from '@core/decorator/graphQLUser.decorator';
import { IUserData } from '@core/interface/default.interface';
import { GraphQLRoles } from '@core/decorator/graphQLRoles.decorator';
import { ERole } from '@core/enum';
import { DeathAnniversary } from '@core/database/entity/deathAnniversary.entity';
import { DeathAnniversaryRes } from './entities/death-anniversary-res.entity';

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
}
