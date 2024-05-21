import { Field, Int, ObjectType } from '@nestjs/graphql';
import { EPriority } from 'src/core/enum/default.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EventParticipant } from './eventParticipant.entity';
import { EventParticipantType } from './eventParticipantType.entity';
import { Image } from './image.entity';
import 'dotenv/config.js';
import { User } from './user.entity';

@Entity('events')
@ObjectType()
export class Event {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'templeId', type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  templeId: number | null;

  @Column({ name: 'creatorId', type: 'int' })
  @Field(() => Int)
  creatorId: number;

  @Column({ name: 'name', type: 'varchar', length: 250 })
  @Field(() => String)
  name: string;

  @Column({
    name: 'avatar',
    type: 'varchar',
    length: 250,
    default: process.env.APP_URL + '/event-default.png',
  })
  @Field(() => String)
  avatar: string;

  @Column({
    name: 'description',
    type: 'varchar',
    nullable: true,
  })
  @Field(() => String, { nullable: true })
  description: string;

  @Column({ name: 'startDateEvent', type: 'timestamp' })
  @Field(() => Date)
  startDateEvent: Date;

  @Column({ name: 'endDateEvent', type: 'timestamp' })
  @Field(() => Date)
  endDateEvent: Date;

  @Column({ name: 'startDateBooking', type: 'timestamp' })
  @Field(() => Date)
  startDateBooking: Date;

  @Column({ name: 'endDateBooking', type: 'timestamp' })
  @Field(() => Date)
  endDateBooking: Date;

  @Column({ name: 'address', type: 'varchar', length: 250 })
  @Field(() => String)
  address: string;

  @Column({ name: 'phone', type: 'varchar', length: 250, nullable: true })
  @Field(() => String, { nullable: true })
  phone: string;

  @Column({ name: 'email', type: 'varchar', length: 250, nullable: true })
  @Field(() => String, { nullable: true })
  email: string;

  @Column({
    name: 'priority',
    type: 'enum',
    enum: EPriority,
    default: EPriority.MEDIUM,
  })
  @Field(() => EPriority, { defaultValue: EPriority.MEDIUM })
  priority: EPriority;

  @Column({ name: 'priorityExpired', type: 'timestamp', nullable: true })
  @Field(() => Date, { nullable: true })
  priorityExpired: Date | null;

  @Column({ name: 'isDeleted', type: 'boolean', default: false })
  @Field(() => Boolean)
  isDeleted: boolean;

  @Column({ name: 'maxParticipant', type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  maxParticipant: number | null;

  @Column({
    name: 'createdAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Field(() => Date)
  createdAt: Date;

  @Column({
    name: 'updatedAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Field(() => Date)
  updatedAt: Date;

  @OneToMany(
    () => EventParticipant,
    (eventParticipant) => eventParticipant.event,
  )
  @Field(() => [EventParticipant])
  eventParticipants: EventParticipant[];

  @OneToMany(() => Image, (image) => image.event)
  @Field(() => [Image])
  images: Image[];

  @OneToMany(
    () => EventParticipantType,
    (eventParticipantType) => eventParticipantType.event,
  )
  @Field(() => [EventParticipantType])
  eventParticipantTypes: EventParticipantType[];

  @ManyToOne(() => User, (user) => user.events)
  @JoinColumn({ name: 'creatorId' })
  @Field(() => User)
  user: User;
}
