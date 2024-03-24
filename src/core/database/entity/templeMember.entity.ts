import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Temple } from './temple.entity';
import { User } from './user.entity';

@Entity('templeMembers')
@ObjectType()
export class TempleMember {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'templeId', type: 'int' })
  @Field(() => Int)
  templeId: number;

  @Column({ name: 'userId', type: 'int' })
  @Field(() => Int)
  userId: number;

  @OneToOne(() => User, (user) => user.templeMember)
  @JoinColumn({ name: 'userId' })
  @Field(() => User)
  user: User;

  @ManyToOne(() => Temple, (temple) => temple.templeMembers)
  @JoinColumn({ name: 'templeId' })
  @Field(() => Temple)
  temple: Temple;
}
