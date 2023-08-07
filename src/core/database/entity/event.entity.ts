import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EventParticipant } from './eventParticipant.entity';
import { Image } from './image.entity';
import { EPriority } from 'src/core/enum/default.enum';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'temple_id', type: 'int', nullable: true })
  templeId: number | null;

  @Column({ name: 'name', type: 'varchar', length: 250 })
  name: string;

  @Column({ name: 'avatar', type: 'varchar', length: 250 })
  avatar: string;

  @Column({ name: 'description', type: 'varchar', length: 1000 })
  description: string;

  @Column({ name: 'start_date_event', type: 'date' })
  startDateEvent: Date;

  @Column({ name: 'end_date_event', type: 'date' })
  endDateEvent: Date;

  @Column({ name: 'start_date_booking', type: 'date' })
  startDateBooking: Date;

  @Column({ name: 'end_date_booking', type: 'date' })
  endDateBooking: Date;

  @Column({ name: 'address', type: 'varchar', length: 250 })
  address: string;

  @Column({ name: 'phone', type: 'varchar', length: 250 })
  phone: string;

  @Column({ name: 'email', type: 'varchar', length: 250 })
  email: string;

  @Column({
    name: 'priority',
    type: 'enum',
    enum: EPriority,
    default: EPriority.MEDIUM,
  })
  priority: EPriority;

  @Column({ name: 'priority_expired', type: 'date', nullable: true })
  priorityExpired: Date | null;

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

  @OneToMany(
    () => EventParticipant,
    (eventParticipant) => eventParticipant.event,
  )
  eventParticipants: EventParticipant[];

  @OneToMany(() => Image, (image) => image.event)
  images: Image[];
}
