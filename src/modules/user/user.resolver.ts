import { GraphQLRoles } from '@core/decorator/graphQLRoles.decorator';
import { GraphQLUserData } from '@core/decorator/graphQLUser.decorator';
import { ERole } from '@core/enum';
import { IUserData } from '@core/interface/default.interface';
import { UserService } from '@modules/user/user.service';
import { Query, Resolver } from '@nestjs/graphql';
import { UserRes } from './entities/userRes.entity';

@Resolver(() => UserRes)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => UserRes, { name: 'getUser' })
  @GraphQLRoles(Object.values(ERole))
  getUser(@GraphQLUserData() userData: IUserData) {
    return this.userService.getUser(userData);
  }
}
