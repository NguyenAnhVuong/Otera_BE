import { EPlan, EPriority, EStatus } from 'src/core/enum/default.enum';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { FamilyTemple } from './familyTemple.entity';
import { Image } from './image.entity';
import { Deceased } from './deceased.entity';

@Entity('temples')
export class Temple {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 250 })
  name: string;

  @Column({ name: 'avatar', type: 'varchar', length: 250 })
  avatar: string;

  @Column({ name: 'address', type: 'varchar', length: 250 })
  address: string;

  @Column({ name: 'description', type: 'varchar', length: 5000 })
  description: string;

  @Column({ name: 'phone', type: 'varchar', length: 250, nullable: true })
  phone: string;

  @Column({ name: 'email', type: 'varchar', length: 250, nullable: true })
  email: string;

  @Column({ name: 'website', type: 'varchar', length: 250, nullable: true })
  website: string | null;

  @Column({
    name: 'priority',
    type: 'enum',
    enum: EPriority,
    default: EPriority.MEDIUM,
  })
  priority: EPriority;

  @Column({ name: 'priority_expired', type: 'date', nullable: true })
  priorityExpired: Date | null;

  @Column({ name: 'plan', type: 'enum', enum: EPlan, default: EPlan.FREE })
  plan: EPlan;

  @Column({ name: 'plan_expired', type: 'date', nullable: true })
  planExpired: Date | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: EStatus,
    default: EStatus.ACTIVE,
  })
  status: EStatus;

  @Column({ name: 'admin_id', type: 'int' })
  adminId: number;

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

  @OneToMany(() => Deceased, (deceased) => deceased.temple)
  deceaseds: Deceased[];

  @OneToMany(() => FamilyTemple, (familyTemple) => familyTemple.temple)
  familyTemples: FamilyTemple[];

  @OneToMany(() => Image, (image) => image.temple)
  images: Image[];
}
