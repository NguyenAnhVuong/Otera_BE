import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Deceased } from 'src/core/database/entity/deceased.entity';
import { ERole } from 'src/core/enum/default.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DeathAnniversary } from './deathAnniversary.entity';
import { Event } from './event.entity';
import { EventParticipant } from './eventParticipant.entity';
import { Family } from './family.entity';
import { Review } from './review.entity';
import { FollowerTemple } from './followerTemple.entity';
import { Temple } from './temple.entity';
import { UserDetail } from './userDetail.entity';

registerEnumType(ERole, {
  name: 'ERole',
});
@Entity('users')
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'email', type: 'varchar', length: 100 })
  @Field(() => String)
  email: string;

  @Column({ name: 'password', type: 'varchar', length: 100, select: false })
  password: string;

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

  // add templeId for temple admin and temple member

  @Column({ name: 'userDetailId', type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  userDetailId: number | null;

  @Column({
    name: 'createdAt',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Field(() => Date)
  createdAt: Date;

  @Column({
    name: 'updatedAt',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Field(() => Date)
  updatedAt: Date;

  @OneToOne(() => Temple, (temple) => temple.admin)
  @Field(() => Temple)
  temple: Temple;

  @OneToOne(() => UserDetail, (userDetail) => userDetail.user)
  @JoinColumn({ name: 'userDetailId' })
  @Field(() => UserDetail)
  userDetail: UserDetail;

  @ManyToOne(() => Family, (family) => family.users)
  @JoinColumn({ name: 'familyId' })
  @Field(() => Family, { nullable: true })
  family: Family;

  @OneToMany(() => Review, (review) => review.user)
  @Field(() => [Review])
  reviews: Review[];

  @OneToMany(
    () => DeathAnniversary,
    (deathAnniversary) => deathAnniversary.user,
  )
  @Field(() => [DeathAnniversary])
  deathAnniversaries: DeathAnniversary[];

  @OneToMany(() => FollowerTemple, (templeMember) => templeMember.user)
  @Field(() => FollowerTemple)
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
}
