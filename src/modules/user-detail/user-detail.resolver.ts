import { Resolver } from '@nestjs/graphql';
import { UserDetailRes } from './entities/userDetailRes.entity';
import { UserDetailService } from './user-detail.service';

@Resolver(() => UserDetailRes)
export class UserDetailResolver {
  constructor(private readonly userDetailService: UserDetailService) {}
}
