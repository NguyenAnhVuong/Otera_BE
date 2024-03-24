import { Temple } from '@core/database/entity/temple.entity';
import { GQLArgsPaging } from '@core/decorator/gqlQueryPaging.decorator';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { VSystemGetTemplesDto } from './dto/system-get-temples.input';
import { TemplesRes } from './entities/templesRes.entity';
import { TempleService } from './temple.service';

@Resolver(() => Temple)
export class TempleResolver {
  constructor(private readonly templeService: TempleService) {}

  // @GQLRoles([ERole.SYSTEM])
  @Query(() => TemplesRes, { name: 'systemGetTemples' })
  systemGetTemples(
    @Args()
    @GQLArgsPaging()
    systemGetTemplesQuery: VSystemGetTemplesDto,
  ) {
    return this.templeService.systemGetTemples(systemGetTemplesQuery);
  }
}
