import { Deceased } from '@core/database/entity/deceased.entity';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { DeceasedService } from './deceased.service';

import { GQLRoles } from '@core/decorator/gqlRoles.decorator';
import { ERole } from '@core/enum';
import { ListDeceasedRes } from './entities/listDeceasedRes.entity';
import { GQLUserData } from '@core/decorator/gqlUser.decorator';
import { IUserData } from '@core/interface/default.interface';
import { DeceasedRes } from './entities/deceasedRes.entity';

@Resolver(() => Deceased)
export class DeceasedResolver {
  constructor(private readonly deceasedService: DeceasedService) {}

  @GQLRoles([ERole.FAMILY_ADMIN, ERole.FAMILY_MEMBER])
  @Query(() => ListDeceasedRes, { name: 'getListDeceased' })
  getListDeceasedByFamilyId(
    @Args('familyId', { type: () => Int }) familyId: number,
  ) {
    return this.deceasedService.getListDeceasedByFamilyId(familyId);
  }

  @GQLRoles([ERole.FAMILY_ADMIN, ERole.FAMILY_MEMBER])
  @Query(() => DeceasedRes, { name: 'getDeceased' })
  getDeceasedById(
    @Args('id', { type: () => Int }) id: number,
    @GQLUserData() userData: IUserData,
  ) {
    return this.deceasedService.getDeceasedByIdAndFamilyId(
      id,
      userData.familyId,
    );
  }
}
