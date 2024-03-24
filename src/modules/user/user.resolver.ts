import { GQLRoles } from '@core/decorator/gqlRoles.decorator';
import { GQLUserData } from '@core/decorator/gqlUser.decorator';
import { ERole } from '@core/enum';
import { IUserData } from '@core/interface/default.interface';
import { UserService } from '@modules/user/user.service';
import { Query, Resolver } from '@nestjs/graphql';
import { UserRes } from './entities/userRes.entity';

@Resolver(() => UserRes)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => UserRes, { name: 'getUser' })
  @GQLRoles(Object.values(ERole))
  getUser(@GQLUserData() userData: IUserData) {
    return this.userService.getUser(userData);
  }
}
