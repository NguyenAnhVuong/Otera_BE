import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Deceased } from './deceased.entity';
import { Temple } from './temple.entity';
import { Event } from './event.entity';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'deceased_id', type: 'int', nullable: true })
  deceasedId: number | null;

  @Column({ name: 'temple_id', type: 'int', nullable: true })
  templeId: number | null;

  @Column({ name: 'event_id', type: 'int', nullable: true })
  eventId: number | null;

  @Column({ name: 'image', type: 'varchar', length: 255 })
  image: string;

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

  @ManyToOne(() => Deceased, (deceased) => deceased.images)
  @JoinColumn({ name: 'deceased_id' })
  deceased: Deceased;

  @ManyToOne(() => Temple, (temple) => temple.images)
  @JoinColumn({ name: 'temple_id' })
  temple: Temple;

  @ManyToOne(() => Event, (event) => event.images)
  @JoinColumn({ name: 'event_id' })
  event: Event;
}
