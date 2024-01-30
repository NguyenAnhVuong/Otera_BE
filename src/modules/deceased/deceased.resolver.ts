import { Deceased } from '@core/database/entity/deceased.entity';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { DeceasedService } from './deceased.service';

import { GraphQLRoles } from '@core/decorator/graphQLRoles.decorator';
import { ERole } from '@core/enum';
import { ListDeceasedRes } from './entities/listDeceasedRes.entity';
import { GraphQLUserData } from '@core/decorator/graphQLUser.decorator';
import { IUserData } from '@core/interface/default.interface';
import { DeceasedRes } from './entities/deceasedres.entity';

@Resolver(() => Deceased)
export class DeceasedResolver {
  constructor(private readonly deceasedService: DeceasedService) {}

  @GraphQLRoles([ERole.FAMILY_ADMIN, ERole.FAMILY_MEMBER])
  @Query(() => ListDeceasedRes, { name: 'getListDeceased' })
  getListDeceasedByFamilyId(
    @Args('familyId', { type: () => Int }) familyId: number,
  ) {
    return this.deceasedService.getListDeceasedByFamilyId(familyId);
  }

  @GraphQLRoles([ERole.FAMILY_ADMIN, ERole.FAMILY_MEMBER])
  @Query(() => DeceasedRes, { name: 'getDeceased' })
  getDeceasedById(
    @Args('id', { type: () => Int }) id: number,
    @GraphQLUserData() userData: IUserData,
  ) {
    return this.deceasedService.getDeceasedByIdAndFamilyId(
      id,
      userData.familyId,
    );
  }
}
