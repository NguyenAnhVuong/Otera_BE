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
import { User } from './user.entity';

registerEnumType(EBookingStatus, {
  name: 'EBookingStatus',
});
@Entity('eventParticipants')
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
    default: EBookingStatus.BOOKING,
  })
  @Field(() => EBookingStatus, { defaultValue: EBookingStatus.BOOKING })
  bookingStatus: EBookingStatus;

  @Column({ name: 'code', type: 'varchar', length: 10, nullable: true })
  @Field(() => String, { nullable: true })
  code: string;

  @Column({ name: 'rejectReason', type: 'text', nullable: true })
  @Field(() => String, { nullable: true })
  rejectReason: string;

  @Column({ name: 'isDeleted', type: 'boolean', default: false })
  @Field(() => Boolean)
  isDeleted: boolean;

  @Column({ name: 'approverId', type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  approverId: number;

  @Column({ name: 'checkInAt', type: 'timestamp', nullable: true })
  @Field(() => Date, { nullable: true })
  checkInAt: Date;

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

  @ManyToOne(() => Event, (event) => event.eventParticipants)
  @JoinColumn({ name: 'eventId' })
  @Field(() => Event)
  event: Event;

  @ManyToOne(() => User, (user) => user.eventParticipants)
  @JoinColumn({ name: 'userId' })
  @Field(() => User)
  user: User;

  @ManyToOne(() => User, (user) => user.eventParticipants)
  @JoinColumn({ name: 'approverId' })
  @Field(() => User, { nullable: true })
  approver: User;
}
