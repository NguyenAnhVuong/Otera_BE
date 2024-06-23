import { Temple } from '@core/database/entity/temple.entity';
import { GQLArgsPaging } from '@core/decorator/gqlArgsPaging.decorator';
import { GQLRoles } from '@core/decorator/gqlRoles.decorator';
import { GQLUserData } from '@core/decorator/gqlUser.decorator';
import { IsPublicOrAuth } from '@core/decorator/publicOrAuth.decorator';
import { ERole } from '@core/enum';
import { UpdateRes } from '@core/global/entities/updateRes.entity';
import { IUserData } from '@core/interface/default.interface';
import { HttpStatus, ParseIntPipe } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { VAddTempleMemberInput } from './dto/add-temple-member.input';
import { VRemoveTempleMemberInput } from './dto/remove-temple-member.input';
import { VSystemGetTemplesDto } from './dto/system-get-temples.input';
import { VUpdateStatusTempleInput } from './dto/update-status-temple.input';
import { TempleRes } from './entities/templeRes.entity';
import { TemplesRes } from './entities/templesRes.entity';
import { TempleService } from './temple.service';
import { TempleMembersRes } from './entities/templeMembersRes.entity';
import { VGetTempleMembersArgs } from './dto/get-temple-members.args';
import { VUpdateTempleInput } from './dto/update-temple-input';

@Resolver(() => Temple)
export class TempleResolver {
  constructor(private readonly templeService: TempleService) {}

  @GQLRoles([ERole.SYSTEM])
  @Query(() => TemplesRes, { name: 'systemGetTemples' })
  systemGetTemples(
    @Args()
    @GQLArgsPaging()
    systemGetTemplesQuery: VSystemGetTemplesDto,
  ) {
    return this.templeService.systemGetTemples(systemGetTemplesQuery);
  }

  @Query(() => TempleRes, { name: 'getTempleDetail' })
  @IsPublicOrAuth()
  getTempleDetail(
    @GQLUserData() userData: IUserData,
    @Args(
      'id',
      { type: () => Int },
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ) {
    return this.templeService.getTempleDetail(id, userData);
  }

  @GQLRoles([ERole.SYSTEM])
  @Mutation(() => UpdateRes, { name: 'updateStatusTemple' })
  updateStatusTemple(
    @Args('updateStatusTempleInput')
    updateStatusTempleInput: VUpdateStatusTempleInput,
    @GQLUserData() userData: IUserData,
  ) {
    return this.templeService.updateStatusTemple(
      updateStatusTempleInput,
      userData,
    );
  }

  @GQLRoles([ERole.TEMPLE_ADMIN])
  @Mutation(() => UpdateRes, { name: 'addTempleMember' })
  addTempleMember(
    @GQLUserData() userData: IUserData,
    @Args('addTempleMemberInput')
    addTempleMemberInput: VAddTempleMemberInput,
  ) {
    return this.templeService.addTempleMember(
      userData.tid[0],
      addTempleMemberInput.email,
    );
  }

  @GQLRoles([ERole.TEMPLE_ADMIN])
  @Query(() => TempleMembersRes, { name: 'getTempleMembers' })
  getTempleMembers(
    @GQLUserData() userData: IUserData,
    @GQLArgsPaging() @Args() getTempleMembersArgs: VGetTempleMembersArgs,
  ) {
    return this.templeService.getTempleMembers(
      userData.tid[0],
      getTempleMembersArgs,
    );
  }

  @GQLRoles([ERole.TEMPLE_ADMIN])
  @Mutation(() => UpdateRes, { name: 'removeTempleMember' })
  removeTempleMember(
    @GQLUserData() userData: IUserData,
    @Args('removeTempleMemberInput')
    removeTempleMemberInput: VRemoveTempleMemberInput,
  ) {
    return this.templeService.removeTempleMember(
      userData.tid[0],
      removeTempleMemberInput,
    );
  }

  @GQLRoles([ERole.TEMPLE_ADMIN])
  @Mutation(() => UpdateRes, { name: 'updateTemple' })
  updateTemple(
    @GQLUserData() userData: IUserData,
    @Args('updateTempleInput') updateTempleInput: VUpdateTempleInput,
  ) {
    return this.templeService.updateTemple(userData.tid[0], updateTempleInput);
  }
}
