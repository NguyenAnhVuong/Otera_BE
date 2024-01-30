import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Temple } from './temple.entity';
import { User } from './user.entity';

@Entity('reviews')
@ObjectType()
export class Review {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'userId', type: 'int' })
  @Field(() => Int)
  userId: number;

  @Column({ name: 'templeId', type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  templeId: number;

  @Column({ name: 'eventId', type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  eventId: number;

  @Column({ name: 'content', type: 'varchar', length: 1000 })
  @Field(() => String)
  content: string;

  @Column({ name: 'rating', type: 'int' })
  @Field(() => Int)
  rating: number;

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

  @ManyToOne(() => Temple, (temple) => temple.reviews)
  @JoinColumn({ name: 'templeId' })
  @Field(() => Temple)
  temple: Temple;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ name: 'userId' })
  @Field(() => User)
  user: User;
}
