import { GQLRoles } from '@core/decorator/gqlRoles.decorator';
import { ERole } from '@core/enum';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { GetFamilyArgs } from './dto/get-family.args';
import { FamilyRes } from './entity/familyRes.input';
import { FamilyService } from './family.service';
import { GetFamilyMembersArgs } from './dto/get-family-members.dto';
import { FamilyMembersRes } from './entity/familyMembersRes.entity';
import { GQLUserData } from '@core/decorator/gqlUser.decorator';
import { IUserData } from '@core/interface/default.interface';
import { GQLArgsPaging } from '@core/decorator/gqlQueryPaging.decorator';

@Resolver(() => FamilyRes)
export class FamilyResolver {
  constructor(private readonly familyService: FamilyService) {}

  @GQLRoles([
    ERole.TEMPLE_ADMIN,
    ERole.FAMILY_ADMIN,
    ERole.FAMILY_ADMIN,
    ERole.FAMILY_MEMBER,
  ])
  @Query(() => FamilyRes, { name: 'getFamily' })
  async getFamily(@Args() getFamilyArgs: GetFamilyArgs) {
    return await this.familyService.getFamilyById(getFamilyArgs);
  }

  @GQLRoles([
    ERole.TEMPLE_ADMIN,
    ERole.FAMILY_ADMIN,
    ERole.FAMILY_ADMIN,
    ERole.FAMILY_MEMBER,
  ])
  @Query(() => FamilyMembersRes, { name: 'getFamilyMembers' })
  async getFamilyMembers(
    @GQLUserData() userData: IUserData,
    @GQLArgsPaging()
    @Args()
    getFamilyMembersArgs: GetFamilyMembersArgs,
  ) {
    return await this.familyService.getFamilyMembers(
      userData,
      getFamilyMembersArgs,
    );
  }
}
