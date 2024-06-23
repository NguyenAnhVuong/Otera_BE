import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UserDetailRes } from './entities/userDetailRes.entity';
import { UserDetailService } from './user-detail.service';
import { GQLRoles } from '@core/decorator/gqlRoles.decorator';
import { ERole } from '@core/enum';
import { UpdateRes } from '@core/global/entities/updateRes.entity';
import { GQLUserData } from '@core/decorator/gqlUser.decorator';
import { IUserData } from '@core/interface/default.interface';
import { VUpdateUserDetailInput } from './dto/update-user-detail.input';

@Resolver(() => UserDetailRes)
export class UserDetailResolver {
  constructor(private readonly userDetailService: UserDetailService) {}

  @GQLRoles(Object.values(ERole))
  @Mutation(() => UpdateRes, { name: 'updateUser' })
  updateUserDetail(
    @GQLUserData() userData: IUserData,
    @Args('updateUserDetailInput')
    updateUserDetailInput: VUpdateUserDetailInput,
  ) {
    return this.userDetailService.userUpdateUserDetail(
      userData,
      updateUserDetailInput,
    );
  }
}
