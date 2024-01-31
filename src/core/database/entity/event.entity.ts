import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EventParticipant } from './eventParticipant.entity';
import { Image } from './image.entity';
import { EPriority } from 'src/core/enum/default.enum';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { EventParticipantType } from './eventParticipantType.entity';

@Entity('events')
@ObjectType()
export class Event {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'templeId', type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  templeId: number | null;

  @Column({ name: 'name', type: 'varchar', length: 250 })
  @Field(() => String)
  name: string;

  @Column({ name: 'avatar', type: 'varchar', length: 250 })
  @Field(() => String)
  avatar: string;

  @Column({ name: 'description', type: 'varchar', length: 1000 })
  @Field(() => String)
  description: string;

  @Column({ name: 'startDateEvent', type: 'date' })
  @Field(() => String)
  startDateEvent: Date;

  @Column({ name: 'endDateEvent', type: 'date' })
  @Field(() => String)
  endDateEvent: Date;

  @Column({ name: 'startDateBooking', type: 'date' })
  @Field(() => String)
  startDateBooking: Date;

  @Column({ name: 'endDateBooking', type: 'date' })
  @Field(() => String)
  endDateBooking: Date;

  @Column({ name: 'address', type: 'varchar', length: 250 })
  @Field(() => String)
  address: string;

  @Column({ name: 'phone', type: 'varchar', length: 250 })
  @Field(() => String)
  phone: string;

  @Column({ name: 'email', type: 'varchar', length: 250 })
  @Field(() => String)
  email: string;

  @Column({
    name: 'priority',
    type: 'enum',
    enum: EPriority,
    default: EPriority.MEDIUM,
  })
  @Field(() => EPriority, { defaultValue: EPriority.MEDIUM })
  priority: EPriority;

  @Column({ name: 'priorityExpired', type: 'date', nullable: true })
  @Field(() => Date, { nullable: true })
  priorityExpired: Date | null;

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
}
