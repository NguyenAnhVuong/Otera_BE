import { EStatus } from 'src/core/enum/default.enum';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { FamilyTemple } from './familyTemple.entity';
import { Deceased } from './deceased.entity';

@Entity('families')
export class Family {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'admin_id', type: 'int' })
  adminId: number;

  @Column({ name: 'name', type: 'varchar', length: 250 })
  name: string;

  @Column({ name: 'description', type: 'varchar', length: 1000 })
  description: string;

  @Column({ name: 'address', type: 'varchar', length: 250 })
  address: string;

  @Column({ name: 'phone', type: 'varchar', length: 20 })
  phone: string;

  @Column({ name: 'avatar', type: 'varchar', length: 250 })
  avatar: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: EStatus,
    default: EStatus.ACTIVE,
  })
  status: EStatus;

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

  @OneToMany(() => User, (user) => user.family)
  users: User[];

  @OneToMany(() => Deceased, (deceased) => deceased.family)
  deceaseds: Deceased[];

  @OneToMany(() => FamilyTemple, (familyTemple) => familyTemple.family)
  familyTemples: FamilyTemple[];
}
