import { User } from '@core/database/entity/user.entity';
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
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { DeathAnniversary } from './deathAnniversary.entity';

@Entity('deceaseds')
@ObjectType()
export class Deceased {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'dateOfDeath', type: 'varchar', length: 100 })
  @Field(() => String)
  dateOfDeath: string;

  @Column({
    name: 'description',
    type: 'varchar',
    length: 5000,
    nullable: true,
  })
  @Field(() => String, { nullable: true })
  description: string | null;

  @Column({
    name: 'userDetailId',
    type: 'int',
    nullable: true,
  })
  @Field(() => Int, { nullable: true })
  userDetailId: number;

  @Column({
    name: 'templeId',
    type: 'int',
  })
  @Field(() => Int)
  templeId: number;

  @Column({
    name: 'familyId',
    type: 'int',
  })
  @Field(() => Int)
  familyId: number;

  @Column({ name: 'creatorId', type: 'int' })
  @Field(() => Int)
  creatorId: number;

  @Column({ name: 'modifierId', type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  modifierId: number;

  @Column({ name: 'isDeleted', type: 'boolean', default: false })
  @Field(() => Boolean)
  isDeleted: boolean;

  @Column({
    name: 'createdAt',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Field(() => Date)
  createdAt: Date;

  @Column({
    name: 'updatedAt',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Field(() => Date)
  updatedAt: Date;

  @ManyToOne(() => Temple, (temple) => temple.deceaseds)
  @JoinColumn({ name: 'templeId' })
  @Field(() => Temple)
  temple: Temple;

  @ManyToOne(() => Family, (family) => family.deceaseds)
  @JoinColumn({ name: 'familyId' })
  @Field(() => Family)
  family: Family;

  @OneToMany(() => Image, (image) => image.deceased)
  @Field(() => [Image])
  images: Image[];

  @OneToOne(() => UserDetail, (userDetail) => userDetail.deceased)
  @JoinColumn({ name: 'userDetailId' })
  @Field(() => UserDetail)
  userDetail: UserDetail;

  @OneToMany(
    () => DeathAnniversary,
    (deathAnniversary) => deathAnniversary.deceased,
  )
  @Field(() => [DeathAnniversary])
  deathAnniversaries: DeathAnniversary[];

  @ManyToOne(() => User, (user) => user.modifiedDeceaseds)
  @Field(() => User)
  modifier: User;
}
