import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Deceased } from 'src/core/database/entity/deceased.entity';
import { EAccountStatus, ERole } from 'src/core/enum/default.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DeathAnniversary } from './deathAnniversary.entity';
import { Event } from './event.entity';
import { EventParticipant } from './eventParticipant.entity';
import { Family } from './family.entity';
import { FollowerTemple } from './followerTemple.entity';
import { Temple } from './temple.entity';
import { UserDetail } from './userDetail.entity';
import { Notification } from './notification.entity';
import { ValidationToken } from './validationToken.entity';
import { InviteFamily } from './inviteFamily.entity';

registerEnumType(ERole, {
  name: 'ERole',
});

registerEnumType(EAccountStatus, {
  name: 'EAccountStatus',
});

@Entity('users')
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'email', type: 'varchar', length: 100, unique: true })
  @Field(() => String)
  email: string;

  @Column({ name: 'password', type: 'varchar', length: 100, select: false })
  password: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: EAccountStatus,
    default: EAccountStatus.INACTIVE,
  })
  @Field(() => EAccountStatus, { defaultValue: EAccountStatus.INACTIVE })
  status: EAccountStatus;

  @Column({
    name: 'role',
    type: 'enum',
    enum: ERole,
    default: ERole.PUBLIC_USER,
  })
  @Field(() => ERole, { defaultValue: ERole.PUBLIC_USER })
  role: ERole;

  @Column({ name: 'familyId', type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  familyId: number | null;

  @Column({ name: 'templeId', type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  templeId: number | null;

  @Column({ name: 'userDetailId', type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  userDetailId: number | null;

  @Column({ name: 'passwordChangedAt', type: 'timestamptz', nullable: true })
  @Field(() => Date, { nullable: true })
  passwordChangedAt: Date | null;

  @CreateDateColumn({
    name: 'createdAt',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updatedAt',
    type: 'timestamptz',
    default: null,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  @Field(() => Date, { nullable: true })
  updatedAt: Date;

  @ManyToOne(() => Temple, (temple) => temple.users)
  @Field(() => Temple)
  @JoinColumn({ name: 'templeId' })
  temple: Temple;

  @OneToOne(() => UserDetail, (userDetail) => userDetail.user)
  @JoinColumn({ name: 'userDetailId' })
  @Field(() => UserDetail)
  userDetail: UserDetail;

  @ManyToOne(() => Family, (family) => family.users)
  @JoinColumn({ name: 'familyId' })
  @Field(() => Family, { nullable: true })
  family: Family;

  @OneToMany(
    () => DeathAnniversary,
    (deathAnniversary) => deathAnniversary.user,
  )
  @Field(() => [DeathAnniversary])
  deathAnniversaries: DeathAnniversary[];

  @OneToMany(() => FollowerTemple, (templeMember) => templeMember.user)
  @Field(() => [FollowerTemple])
  followerTemples: FollowerTemple[];

  @OneToMany(() => Event, (event) => event.user)
  @Field(() => [Event])
  events: Event[];

  @OneToMany(() => EventParticipant, (event) => event.user)
  @Field(() => [EventParticipant])
  eventParticipants: EventParticipant[];

  @OneToMany(() => Deceased, (deceased) => deceased.modifier)
  @Field(() => [Deceased])
  modifiedDeceaseds: Deceased[];

  @OneToMany(() => Notification, (notification) => notification.user)
  @Field(() => [Notification])
  notifications: Notification[];

  @OneToMany(() => ValidationToken, (validationToken) => validationToken.user)
  @Field(() => [ValidationToken])
  validationTokens: ValidationToken[];

  @OneToMany(() => InviteFamily, (inviteFamily) => inviteFamily.user)
  @Field(() => [InviteFamily])
  inviteFamilies: InviteFamily[];
}
