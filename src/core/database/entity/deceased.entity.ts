import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Image } from './image.entity';
import { Temple } from './temple.entity';
import { Family } from './family.entity';
import { UserDetail } from './userDetail.entity';

@Entity('deceased')
export class Deceased {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'date_of_death', type: 'date' })
  dateOfDeath: Date;

  @Column({
    name: 'user_detail_id',
    type: 'int',
    nullable: true,
  })
  userDetailId: number;

  @Column({
    name: 'temple_id',
    type: 'int',
  })
  templeId: number;

  @Column({
    name: 'family_id',
    type: 'int',
  })
  familyId: number;

  @Column({ name: 'creator_id', type: 'int' })
  creatorId: number;

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

  @ManyToOne(() => Temple, (temple) => temple.deceaseds)
  @JoinColumn({ name: 'temple_id' })
  temple: Temple;

  @ManyToOne(() => Family, (family) => family.deceaseds)
  @JoinColumn({ name: 'family_id' })
  family: Family;

  @OneToMany(() => Image, (image) => image.deceased)
  images: Image[];

  @OneToOne(() => UserDetail, (userDetail) => userDetail.deceased)
  @JoinColumn({ name: 'user_detail_id' })
  userDetail: UserDetail;
}
