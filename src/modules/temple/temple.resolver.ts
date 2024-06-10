import { Temple } from '@core/database/entity/temple.entity';
import { GQLArgsPaging } from '@core/decorator/gqlQueryPaging.decorator';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { VSystemGetTemplesDto } from './dto/system-get-temples.input';
import { TemplesRes } from './entities/templesRes.entity';
import { TempleService } from './temple.service';
import { TempleRes } from './entities/templeRes.entity';
import { IsPublicOrAuth } from '@core/decorator/publicOrAuth.decorator';
import { IUserData } from '@core/interface/default.interface';
import { GQLUserData } from '@core/decorator/gqlUser.decorator';
import { HttpStatus, ParseIntPipe } from '@nestjs/common';
import { GQLRoles } from '@core/decorator/gqlRoles.decorator';
import { ERole } from '@core/enum';
import { UpdateRes } from '@core/global/entities/updateRes.entity';
import { VUpdateStatusTempleInput } from './dto/update-status-temple.input';

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
  ) {
    return this.templeService.updateStatusTemple(updateStatusTempleInput);
  }
}
