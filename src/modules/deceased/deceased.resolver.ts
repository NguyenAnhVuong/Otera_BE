import { Deceased } from '@core/database/entity/deceased.entity';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DeceasedService } from './deceased.service';

import { GQLArgsPaging } from '@core/decorator/gqlArgsPaging.decorator';
import { GQLRoles } from '@core/decorator/gqlRoles.decorator';
import { GQLUserData } from '@core/decorator/gqlUser.decorator';
import { ERole } from '@core/enum';
import { UpdateRes } from '@core/global/entities/updateRes.entity';
import { IUserData } from '@core/interface/default.interface';
import { HttpStatus, ParseIntPipe } from '@nestjs/common';
import { VFamilyGetListDeceasedArgs } from './dto/family-get-list-deceased.dto';
import { VTempleGetListDeceasedArgs } from './dto/temple-get-deceased-list.args';
import { VUpdateDeceasedStatusInput } from './dto/update-deceased-status.input';
import { VUpdateDeceasedInput } from './dto/update-deceased.input';
import { DeceasedListRes } from './entities/deceasedListRes.entity';
import { DeceasedRes } from './entities/deceasedRes.entity';
import { VAddDeceasedImageInput } from './dto/add-deceased-image.input';
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
  @Query(() => DeceasedListRes, { name: 'familyGetListDeceased' })
  familyGetListDeceased(
    @GQLUserData() userData: IUserData,
    @GQLArgsPaging() @Args() query: VFamilyGetListDeceasedArgs,
  ) {
    return this.deceasedService.getListDeceasedByFamilyId(userData.fid, query);
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

  @GQLRoles([ERole.FAMILY_ADMIN, ERole.FAMILY_MEMBER])
  @Mutation(() => UpdateRes, { name: 'addDeceasedImage' })
  addDeceasedImage(
    @GQLUserData() userData: IUserData,
    @Args('addDeceasedImageInput')
    addDeceasedImageInput: VAddDeceasedImageInput,
  ) {
    return this.deceasedService.addDeceasedImage(
      userData,
      addDeceasedImageInput,
    );
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
