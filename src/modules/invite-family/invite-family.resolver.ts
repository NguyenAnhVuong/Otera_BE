import { GQLRoles } from '@core/decorator/gqlRoles.decorator';
import { GQLUserData } from '@core/decorator/gqlUser.decorator';
import { ERole } from '@core/enum';
import { CreateRes } from '@core/global/entities/createRes.entity';
import { UpdateRes } from '@core/global/entities/updateRes.entity';
import { IUserData } from '@core/interface/default.interface';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { InviteFamilyInput } from './dto/invite-family.input';
import { ResponseInviteFamilyInput } from './dto/response-invite-family.input';
import { InviteFamilyService } from './invite-family.service';

@Resolver()
export class InviteFamilyResolver {
  constructor(private readonly inviteFamilyService: InviteFamilyService) {}

  @GQLRoles([ERole.PUBLIC_USER])
  @Mutation(() => UpdateRes, { name: 'responseFamilyInvitation' })
  responseFamilyInvitation(
    @GQLUserData() userData: IUserData,
    @Args('responseInviteFamilyInput')
    responseInviteFamilyInput: ResponseInviteFamilyInput,
  ) {
    return this.inviteFamilyService.responseFamilyInvitation(
      userData,
      responseInviteFamilyInput,
    );
  }

  @GQLRoles([ERole.FAMILY_ADMIN])
  @Mutation(() => CreateRes, { name: 'inviteToFamily' })
  inviteToFamily(
    @GQLUserData() userData: IUserData,
    @Args('inviteFamilyInput') inviteFamilyInput: InviteFamilyInput,
  ) {
    return this.inviteFamilyService.inviteToFamily(userData, inviteFamilyInput);
  }
}
