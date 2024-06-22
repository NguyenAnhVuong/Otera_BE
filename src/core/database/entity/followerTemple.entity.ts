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
import { Temple } from './temple.entity';
import { User } from './user.entity';

@Entity('followerTemples')
@ObjectType()
export class FollowerTemple {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'templeId', type: 'int' })
  @Field(() => Int)
  templeId: number;

  @Column({ name: 'userId', type: 'int' })
  @Field(() => Int)
  userId: number;

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

  @ManyToOne(() => User, (user) => user.followerTemples)
  @JoinColumn({ name: 'userId' })
  @Field(() => User)
  user: User;

  @ManyToOne(() => Temple, (temple) => temple.followerTemples)
  @JoinColumn({ name: 'templeId' })
  @Field(() => Temple)
  temple: Temple;
}
