import { EStatus } from '@core/enum';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Family } from './family.entity';

@Entity('inviteFamilies')
@ObjectType()
export class InviteFamily {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'familyId', type: 'int' })
  @Field(() => Int)
  familyId: number;

  @Column({ name: 'userId', type: 'int' })
  @Field(() => Int)
  userId: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: EStatus,
    default: EStatus.PENDING,
  })
  @Field(() => EStatus, { defaultValue: EStatus.PENDING })
  status: EStatus;

  @Column({
    name: 'isDeleted',
    type: 'boolean',
    default: false,
  })
  @Field(() => Boolean)
  isDeleted: boolean;

  @Column({
    name: 'expiredAt',
    type: 'timestamptz',
  })
  @Field(() => Date)
  expiredAt: Date;

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

  @ManyToOne(() => User, (user) => user.inviteFamilies)
  @Field(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Family, (family) => family.inviteFamilies)
  @Field(() => Family)
  @JoinColumn({ name: 'familyId' })
  family: Family;
}
