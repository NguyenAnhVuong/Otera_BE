import { GQLArgsPaging } from '@core/decorator/gqlQueryPaging.decorator';
import { GQLRoles } from '@core/decorator/gqlRoles.decorator';
import { GQLUserData } from '@core/decorator/gqlUser.decorator';
import { ERole } from '@core/enum';
import { CreateRes } from '@core/global/entities/createRes.entity';
import { DeleteRes } from '@core/global/entities/deleteRes.entity';
import { IUserData } from '@core/interface/default.interface';
import { HttpStatus, ParseIntPipe } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { VFollowTempleInput } from './dto/follow-temple.input';
import { VGetFollowerArgs } from './dto/temple-get-follower.args';
import { FollowerTemplesRes } from './entities/followerTemplesRes.entity';
import { FollowerTempleService } from './follower-temple.service';

@Resolver()
export class FollowerTempleResolver {
  constructor(private readonly followerTempleService: FollowerTempleService) {}

  @GQLRoles([ERole.FAMILY_ADMIN, ERole.FAMILY_MEMBER, ERole.PUBLIC_USER])
  @Mutation(() => CreateRes, { name: 'followTemple' })
  followTemple(
    @Args('followTempleInput')
    followTempleInput: VFollowTempleInput,
    @GQLUserData() userData: IUserData,
  ) {
    return this.followerTempleService.createFollowerTemple(
      userData.id,
      followTempleInput,
    );
  }

  @GQLRoles([ERole.TEMPLE_MEMBER, ERole.TEMPLE_ADMIN])
  @Query(() => FollowerTemplesRes, { name: 'templeGetFollowers' })
  templeGetFollowers(
    @GQLUserData() userData: IUserData,
    @GQLArgsPaging() @Args() getFollowerArgs: VGetFollowerArgs,
  ) {
    return this.followerTempleService.getFollowerTemplesByTempleId(
      userData.tid[0],
      getFollowerArgs,
    );
  }

  @GQLRoles([ERole.FAMILY_ADMIN, ERole.FAMILY_MEMBER, ERole.PUBLIC_USER])
  @Mutation(() => DeleteRes, { name: 'unfollowTemple' })
  unfollowTemple(
    @GQLUserData() userData: IUserData,
    @Args(
      'templeId',
      { type: () => Int },
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    templeId: number,
  ) {
    return this.followerTempleService.deleteFollowerTemple(
      userData.id,
      templeId,
    );
  }
}
