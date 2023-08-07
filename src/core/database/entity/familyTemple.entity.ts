import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Family } from './family.entity';
import { Temple } from './temple.entity';

@Entity('family_temples')
export class FamilyTemple {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'family_id', type: 'int', nullable: true })
  familyId: number | null;

  @Column({ name: 'temple_id', type: 'int', nullable: true })
  templeId: number | null;

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

  @ManyToOne(() => Family, (family) => family.familyTemples)
  @JoinColumn({ name: 'family_id' })
  family: Family;

  @ManyToOne(() => Temple, (temple) => temple.familyTemples)
  @JoinColumn({ name: 'temple_id' })
  temple: Temple;
}
