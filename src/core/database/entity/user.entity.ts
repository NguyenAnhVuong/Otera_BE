import { ERole } from 'src/core/enum/default.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserDetail } from './userDetail.entity';
import { Family } from './family.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'email', type: 'varchar', length: 100 })
  email: string;

  @Column({ name: 'password', type: 'varchar', length: 100 })
  password: string;

  @Column({
    name: 'role',
    type: 'enum',
    enum: ERole,
    default: ERole.PUBLIC_USER,
  })
  role: ERole;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken: string | null;

  @Column({ name: 'family_id', type: 'int', nullable: true })
  familyId: number | null;

  @Column({ name: 'user_detail_id', type: 'int', nullable: true })
  userDetailId: number | null;

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

  @OneToOne(() => UserDetail, (userDetail) => userDetail.user)
  @JoinColumn({ name: 'user_detail_id' })
  userDetail: UserDetail;

  @ManyToOne(() => Family, (family) => family.users)
  @JoinColumn({ name: 'family_id' })
  family: Family;
}
