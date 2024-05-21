import { InviteFamily } from '@core/database/entity/inviteFamily.entity';
import { FamilyModule } from '@modules/family/family.module';
import { NotificationModule } from '@modules/notification/notification.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InviteFamilyResolver } from './invite-family.resolver';
import { InviteFamilyService } from './invite-family.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([InviteFamily]),
    UserModule,
    NotificationModule,
    FamilyModule,
  ],
  providers: [InviteFamilyResolver, InviteFamilyService],
  exports: [InviteFamilyService],
})
export class InviteFamilyModule {}
