import { EGender } from 'src/core/enum/default.enum';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Deceased } from './deceased.entity';

@Entity('user_details')
export class UserDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'avatar', type: 'varchar', length: 250, nullable: true })
  avatar: string | null;

  @Column({ name: 'name', type: 'varchar', length: 500 })
  name: string;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ name: 'birthday', type: 'date' })
  birthday: Date;

  @Column({ name: 'address', type: 'varchar', length: 500, nullable: true })
  address: string | null;

  @Column({
    name: 'gender',
    type: 'enum',
    enum: EGender,
    default: EGender.MALE,
  })
  gender: EGender;

  @Column({
    name: 'citizen_number',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  citizenNumber: string | null;

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

  @OneToOne(() => User, (user) => user.userDetail)
  user: User;

  @OneToOne(() => Deceased, (deceased) => deceased.userDetail)
  deceased: Deceased;
}
