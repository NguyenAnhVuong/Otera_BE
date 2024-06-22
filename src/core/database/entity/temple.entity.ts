import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { EPlan, EPriority, EStatus } from 'src/core/enum/default.enum';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DeathAnniversary } from './deathAnniversary.entity';
import { Deceased } from './deceased.entity';
import { Event } from './event.entity';
import { FollowerTemple } from './followerTemple.entity';
import { Image } from './image.entity';
import { Review } from './review.entity';
import { User } from './user.entity';

registerEnumType(EPriority, {
  name: 'EPriority',
});
registerEnumType(EPlan, {
  name: 'EPlan',
});
registerEnumType(EStatus, {
  name: 'EStatus',
});
@Entity('temples')
@ObjectType()
export class Temple {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 250 })
  @Field(() => String)
  name: string;

  @Column({ name: 'avatar', type: 'varchar', length: 250 })
  @Field(() => String)
  avatar: string;

  @Column({ name: 'address', type: 'varchar', length: 250 })
  @Field(() => String)
  address: string;

  @Column({ name: 'description', type: 'varchar', length: 5000 })
  @Field(() => String)
  description: string;

  @Column({ name: 'phone', type: 'varchar', length: 250 })
  @Field(() => String, { nullable: true })
  phone: string;

  @Column({ name: 'email', type: 'varchar', length: 250 })
  @Field(() => String)
  email: string;

  @Column({ name: 'website', type: 'varchar', length: 250, nullable: true })
  @Field(() => String, { nullable: true })
  website: string | null;

  @Column({
    name: 'priority',
    type: 'enum',
    enum: EPriority,
    default: EPriority.MEDIUM,
  })
  @Field(() => EPriority, { defaultValue: EPriority.MEDIUM })
  priority: EPriority;

  @Column({ name: 'priorityExpired', type: 'timestamptz', nullable: true })
  @Field(() => Date, { nullable: true })
  priorityExpired: Date | null;

  @Column({ name: 'plan', type: 'enum', enum: EPlan, default: EPlan.FREE })
  @Field(() => EPlan, { defaultValue: EPlan.FREE })
  plan: EPlan;

  @Column({ name: 'planExpired', type: 'timestamptz', nullable: true })
  @Field(() => Date, { nullable: true })
  planExpired: Date | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: EStatus,
    default: EStatus.PENDING,
  })
  @Field(() => EStatus, { defaultValue: EStatus.PENDING })
  status: EStatus;

  @Column({
    name: 'rejectReason',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  @Field(() => String, { nullable: true })
  rejectReason: string | null;

  @Column({
    name: 'blockReason',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  @Field(() => String, { nullable: true })
  blockReason: string | null;

  @Column({ name: 'adminId', type: 'int' })
  @Field(() => Int)
  adminId: number;

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

  @OneToMany(() => User, (user) => user.temple)
  @Field(() => [User])
  users: User[];

  @OneToMany(() => Deceased, (deceased) => deceased.temple)
  @Field(() => [Deceased])
  deceaseds: Deceased[];

  @OneToMany(() => Image, (image) => image.temple)
  @Field(() => [Image])
  images: Image[];

  @OneToMany(() => Review, (review) => review.temple)
  @Field(() => [Review])
  reviews: Review[];

  @OneToMany(
    () => DeathAnniversary,
    (deathAnniversary) => deathAnniversary.temple,
  )
  @Field(() => [DeathAnniversary])
  deathAnniversaries: DeathAnniversary[];

  @OneToMany(() => FollowerTemple, (templeMember) => templeMember.temple)
  @Field(() => [FollowerTemple])
  followerTemples: FollowerTemple[];

  @OneToMany(() => Event, (event) => event.temple)
  @Field(() => [Event])
  events: Event[];
}
