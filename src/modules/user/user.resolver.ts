import { GQLRoles } from '@core/decorator/gqlRoles.decorator';
import { GQLUserData } from '@core/decorator/gqlUser.decorator';
import { Public } from '@core/decorator/public.decorator';
import { ERole } from '@core/enum';
import { CreateRes } from '@core/global/entities/createRes.entity';
import { UpdateRes } from '@core/global/entities/updateRes.entity';
import { IUserData } from '@core/interface/default.interface';
import { UserService } from '@modules/user/user.service';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RemoveFamilyMemberInput } from './dto/remove-family-member.input';
import { VForgotPasswordInput } from './dto/forgot-password.input';
import { UserRes } from './entities/userRes.entity';
import { VResetPasswordInput } from './dto/reset-password.input';

@Resolver(() => UserRes)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => UserRes, { name: 'getUser' })
  @GQLRoles(Object.values(ERole))
  getUser(@GQLUserData() userData: IUserData) {
    return this.userService.getUser(userData.id);
  }

  @Public()
  @Mutation(() => UpdateRes, { name: 'verifyRegister' })
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

  @Public()
  @Mutation(() => CreateRes, { name: 'forgotPassword' })
  forgotPassword(
    @Args('forgotPasswordInput') forgotPasswordInput: VForgotPasswordInput,
  ) {
    return this.userService.forgotPassword(forgotPasswordInput.email);
  }

  @Public()
  @Mutation(() => UpdateRes, { name: 'resetPassword' })
  resetPassword(
    @Args('resetPasswordInput') resetPasswordInput: VResetPasswordInput,
  ) {
    return this.userService.resetPassword(resetPasswordInput);
  }
}
