import { EBookingStatus } from 'src/core/enum/default.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

registerEnumType(EBookingStatus, {
  name: 'EBookingStatus',
});
@Entity('eventPaticipants')
@ObjectType()
export class EventParticipant {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'eventId', type: 'int' })
  @Field(() => Int)
  eventId: number;

  @Column({ name: 'userId', type: 'int' })
  @Field(() => Int)
  userId: number;

  @Column({
    name: 'bookingStatus',
    type: 'enum',
    enum: EBookingStatus,
  })
  @Field(() => EBookingStatus)
  bookingStatus: EBookingStatus;

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

  @ManyToOne(() => Event, (event) => event.eventParticipants)
  @JoinColumn({ name: 'eventId' })
  @Field(() => Event)
  event: Event;
}
