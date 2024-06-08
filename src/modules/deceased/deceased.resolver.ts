import { Deceased } from '@core/database/entity/deceased.entity';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DeceasedService } from './deceased.service';

import { GQLRoles } from '@core/decorator/gqlRoles.decorator';
import { ERole } from '@core/enum';
import { ListDeceasedRes } from './entities/listDeceasedRes.entity';
import { GQLUserData } from '@core/decorator/gqlUser.decorator';
import { IUserData } from '@core/interface/default.interface';
import { DeceasedRes } from './entities/deceasedRes.entity';
import { UpdateRes } from '@core/global/entities/updateRes.entity';
import { VUpdateDeceasedInput } from './dto/update-deceased.input';
import { HttpStatus, ParseIntPipe } from '@nestjs/common';

@Resolver(() => Deceased)
export class DeceasedResolver {
  constructor(private readonly deceasedService: DeceasedService) {}

  @GQLRoles([ERole.FAMILY_ADMIN, ERole.FAMILY_MEMBER])
  @Query(() => ListDeceasedRes, { name: 'getListDeceased' })
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

  @GQLRoles([ERole.FAMILY_ADMIN, ERole.FAMILY_MEMBER])
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
    return this.deceasedService.getDeceasedByIdAndFamilyId(id, userData.fid);
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
}
