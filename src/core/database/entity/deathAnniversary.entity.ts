import {
  EDeathAnniversaryStatus,
  EDeathAnniversaryType,
  EStatus,
} from '@core/enum';
import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Deceased } from './deceased.entity';
import { Temple } from './temple.entity';
import { User } from './user.entity';
import { Family } from './family.entity';
import { DeathAnniversaryOffering } from './deathAnniversaryOffering.entity';

registerEnumType(EDeathAnniversaryStatus, {
  name: 'EDeathAnniversaryStatus',
});

registerEnumType(EDeathAnniversaryType, {
  name: 'EDeathAnniversaryType',
});

@Entity('deathAnniversaries')
@ObjectType()
export class DeathAnniversary {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'deceasedId', type: 'int' })
  @Field(() => Int)
  deceasedId: number;

  @Column({ name: 'familyId', type: 'int' })
  @Field(() => Int)
  familyId: number;

  @Column({ name: 'templeId', type: 'int' })
  @Field(() => Int)
  templeId: number;

  @Column({
    name: 'desiredStartTime',
    type: 'timestamptz',
  })
  @Field(() => Date)
  desiredStartTime: Date;

  @Column({
    name: 'desiredEndTime',
    type: 'timestamptz',
  })
  @Field(() => Date)
  desiredEndTime: Date;

  @Column({ name: 'actualStartTime', type: 'timestamptz', nullable: true })
  @Field(() => Date, { nullable: true })
  actualStartTime: Date | null;

  @Column({ name: 'actualEndTime', type: 'timestamptz', nullable: true })
  @Field(() => Date, { nullable: true })
  actualEndTime: Date | null;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 255,
    default: EDeathAnniversaryStatus.PENDING,
  })
  @Field(() => EDeathAnniversaryStatus)
  status: EDeathAnniversaryStatus;

  @Column({
    name: 'enableUpdate',
    type: 'boolean',
    default: true,
  })
  @Field(() => Boolean)
  enableUpdate: boolean;

  @Column({ name: 'creatorId', type: 'int' })
  @Field(() => Int)
  creatorId: number;

  @Column({ name: 'note', type: 'varchar', length: 5000, nullable: true })
  @Field(() => String, { nullable: true })
  note: string | null;

  @Column({
    name: 'rejectReason',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  @Field(() => String, { nullable: true })
  rejectReason: string | null;

  @Column({ name: 'isDeleted', type: 'boolean', default: false })
  @Field(() => Boolean)
  isDeleted: boolean;

  @Column({ name: 'isLiveStream', type: 'boolean', default: false })
  @Field(() => Boolean)
  isLiveStream: boolean;

  @Column({
    name: 'linkLiveStream',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  @Field(() => String, { nullable: true })
  linkLiveStream: string | null;

  @Column({
    name: 'deathAnniversaryType',
    type: 'enum',
    enum: EDeathAnniversaryType,
    default: EDeathAnniversaryType.REGULAR_ANNIVERSARY,
  })
  @Field(() => EDeathAnniversaryType, {
    defaultValue: EDeathAnniversaryType.REGULAR_ANNIVERSARY,
  })
  deathAnniversaryType: EDeathAnniversaryType;

  @Column({
    name: 'graveAddress',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  @Field(() => String, { nullable: true })
  graveAddress: string | null;

  @Column({
    name: 'readyImage',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  @Field(() => String, { nullable: true })
  readyImage: string | null;

  @Column({
    name: 'finishImage',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  @Field(() => String, { nullable: true })
  finishImage: string | null;

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

  @ManyToOne(() => Deceased, (deceased) => deceased.deathAnniversaries)
  @JoinColumn({ name: 'deceasedId' })
  @Field(() => Deceased)
  deceased: Deceased;

  @ManyToOne(() => Temple, (temple) => temple.deathAnniversaries)
  @JoinColumn({ name: 'templeId' })
  @Field(() => Temple)
  temple: Temple;

  @ManyToOne(() => User, (user) => user.deathAnniversaries)
  @JoinColumn({ name: 'creatorId' })
  @Field(() => User)
  user: User;

  @ManyToOne(() => Family, (family) => family.deathAnniversaries)
  @JoinColumn({ name: 'familyId' })
  @Field(() => Family)
  family: Family;

  @OneToMany(
    () => DeathAnniversaryOffering,
    (deathAnniversaryOffering) => deathAnniversaryOffering.deathAnniversary,
  )
  @Field(() => [DeathAnniversaryOffering])
  deathAnniversaryOfferings: DeathAnniversaryOffering[];
}
