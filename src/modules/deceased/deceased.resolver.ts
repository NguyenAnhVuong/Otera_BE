import { Deceased } from '@core/database/entity/deceased.entity';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DeceasedService } from './deceased.service';

import { GQLRoles } from '@core/decorator/gqlRoles.decorator';
import { GQLUserData } from '@core/decorator/gqlUser.decorator';
import { ERole } from '@core/enum';
import { UpdateRes } from '@core/global/entities/updateRes.entity';
import { IUserData } from '@core/interface/default.interface';
import { HttpStatus, ParseIntPipe } from '@nestjs/common';
import { VUpdateDeceasedStatusInput } from './dto/update-deceased-status.input';
import { VUpdateDeceasedInput } from './dto/update-deceased.input';
import { DeceasedRes } from './entities/deceasedRes.entity';
import { DeceasedListRes } from './entities/deceasedListRes.entity';
import { VTempleGetListDeceasedArgs } from './dto/temple-get-deceased-list.args';
// TODO temple add deceased and redo deceased
@Resolver(() => Deceased)
export class DeceasedResolver {
  constructor(private readonly deceasedService: DeceasedService) {}

  @GQLRoles([ERole.TEMPLE_ADMIN, ERole.TEMPLE_MEMBER])
  @Query(() => DeceasedListRes, { name: 'templeGetDeceasedList' })
  templeGetListDeceased(
    @GQLUserData() userData: IUserData,
    @Args() templeGetDeceasedListArgs: VTempleGetListDeceasedArgs,
  ) {
    return this.deceasedService.templeGetListDeceased(
      userData.tid[0],
      templeGetDeceasedListArgs,
    );
  }

  @GQLRoles([ERole.FAMILY_ADMIN, ERole.FAMILY_MEMBER])
  @Query(() => DeceasedListRes, { name: 'getListDeceased' })
  getListDeceasedByFamilyId(
    @Args(
      'familyId',
      { type: () => Int },
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    familyId: number,
  ) {
    return this.deceasedService.getListDeceasedByFamilyId(familyId);
  }

  @GQLRoles([
    ERole.TEMPLE_ADMIN,
    ERole.TEMPLE_MEMBER,
    ERole.FAMILY_ADMIN,
    ERole.FAMILY_MEMBER,
  ])
  @Query(() => DeceasedRes, { name: 'getDeceased' })
  getDeceasedById(
    @Args(
      'id',
      { type: () => Int },
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @GQLUserData() userData: IUserData,
  ) {
    return this.deceasedService.getDeceasedDetail(id, userData);
  }

  @GQLRoles([ERole.FAMILY_ADMIN, ERole.FAMILY_MEMBER])
  @Mutation(() => UpdateRes, { name: 'updateDeceased' })
  updateDeceased(
    @GQLUserData() userData: IUserData,
    @Args('updateDeceasedInput') updateDeceasedInput: VUpdateDeceasedInput,
  ) {
    return this.deceasedService.updateDeceased(userData, updateDeceasedInput);
  }

  @GQLRoles([ERole.TEMPLE_ADMIN, ERole.FAMILY_ADMIN, ERole.FAMILY_MEMBER])
  @Mutation(() => UpdateRes, { name: 'deleteDeceased' })
  deleteDeceased(
    @GQLUserData() userData: IUserData,
    @Args(
      'id',
      { type: () => Int },
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
      }),
    )
    id: number,
  ) {
    return this.deceasedService.deleteDeceased(userData, id);
  }

  @GQLRoles([ERole.TEMPLE_ADMIN])
  @Mutation(() => UpdateRes, { name: 'restoreDeceased' })
  restoreDeceased(
    @GQLUserData() userData: IUserData,
    @Args(
      'id',
      { type: () => Int },
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
      }),
    )
    id: number,
  ) {
    return this.deceasedService.restoreDeceased(id, userData);
  }

  @GQLRoles([ERole.TEMPLE_ADMIN])
  @Mutation(() => UpdateRes, { name: 'updateDeceasedStatus' })
  updateDeceasedStatus(
    @GQLUserData() userData: IUserData,
    @Args('updateDeceasedStatusInput')
    updateDeceasedStatusInput: VUpdateDeceasedStatusInput,
  ) {
    return this.deceasedService.updateDeceasedStatus(
      updateDeceasedStatusInput,
      userData.tid[0],
    );
  }
}
