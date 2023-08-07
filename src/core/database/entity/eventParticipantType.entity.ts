import { ERole } from 'src/core/enum/default.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('event_participant_types')
export class EventParticipantType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'event_id', type: 'int' })
  eventId: number;

  @Column({ name: 'role', type: 'enum', enum: ERole })
  role: ERole;

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
}
