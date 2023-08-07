import { EBookingStatus } from 'src/core/enum/default.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from './event.entity';

@Entity('event_paticipants')
export class EventParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'event_id', type: 'int' })
  eventId: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({
    name: 'booking_status',
    type: 'enum',
    enum: EBookingStatus,
  })
  bookingStatus: EBookingStatus;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => Event, (event) => event.eventParticipants)
  @JoinColumn({ name: 'event_id' })
  event: Event;
}
