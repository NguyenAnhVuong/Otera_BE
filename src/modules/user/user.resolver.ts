import { GQLRoles } from '@core/decorator/gqlRoles.decorator';
import { GQLUserData } from '@core/decorator/gqlUser.decorator';
import { ERole } from '@core/enum';
import { IUserData } from '@core/interface/default.interface';
import { UserService } from '@modules/user/user.service';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserRes } from './entities/userRes.entity';
import { UpdateRes } from '@core/global/entities/updateRes.entity';
import { RemoveFamilyMemberInput } from './dto/remove-family-member.input';
import { Public } from '@core/decorator/public.decorator';

@Resolver(() => UserRes)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => UserRes, { name: 'getUser' })
  @GQLRoles(Object.values(ERole))
  getUser(@GQLUserData() userData: IUserData) {
    return this.userService.getUser(userData.id);
  }

  @Mutation(() => UpdateRes, { name: 'verifyRegister' })
  @Public()
  verifyRegister(@Args('token') token: string) {
    return this.userService.verifyRegister(token);
  }

  @Mutation(() => UpdateRes, { name: 'removeFamilyMember' })
  @GQLRoles([ERole.FAMILY_ADMIN])
  removeFamilyMember(
    @GQLUserData() userData: IUserData,
    @Args('removeFamilyMemberInput')
    removeFamilyMemberInput: RemoveFamilyMemberInput,
  ) {
    return this.userService.removeFamilyMember(
      userData,
      removeFamilyMemberInput.id,
    );
  }
}
