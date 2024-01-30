import { EStatus } from '@core/enum';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Deceased } from './deceased.entity';
import { Temple } from './temple.entity';
import { User } from './user.entity';

@Entity('deathAnniversaries')
@ObjectType()
export class DeathAnniversary {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'deceasedId', type: 'int' })
  @Field(() => Int)
  deceasedId: number;

  @Column({ name: 'templeId', type: 'int' })
  @Field(() => Int)
  templeId: number;

  @Column({ name: 'desiredStartTime', type: 'timestamp' })
  @Field(() => String)
  desiredStartTime: Date;

  @Column({ name: 'desiredEndTime', type: 'timestamp' })
  @Field(() => String)
  desiredEndTime: Date;

  @Column({ name: 'actualStartTime', type: 'timestamp', nullable: true })
  @Field(() => String, { nullable: true })
  actualStartTime: Date | null;

  @Column({ name: 'actualEndTime', type: 'timestamp', nullable: true })
  @Field(() => String, { nullable: true })
  actualEndTime: Date | null;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 255,
    default: EStatus.PENDING,
  })
  @Field(() => EStatus)
  status: EStatus;

  @Column({ name: 'creatorId', type: 'int' })
  @Field(() => Int)
  creatorId: number;

  @Column({ name: 'note', type: 'varchar', length: 5000, nullable: true })
  @Field(() => String, { nullable: true })
  note: string | null;

  @Column({ name: 'isDeleted', type: 'boolean', default: false })
  @Field(() => Boolean)
  isDeleted: boolean;

  @Column({ name: 'isLiveStream', type: 'boolean', default: false })
  @Field(() => Boolean)
  isLiveStream: boolean;

  @Column({
    name: 'createdAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Field(() => String)
  createdAt: Date;

  @Column({
    name: 'updatedAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Field(() => String)
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
}
