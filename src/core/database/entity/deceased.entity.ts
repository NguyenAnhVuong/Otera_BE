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
import { Field, ObjectType } from '@nestjs/graphql';

@Entity('deceaseds')
@ObjectType()
export class Deceased {
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  id: number;

  @Column({ name: 'dateOfDeath', type: 'varchar', length: 10 })
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
  @Field(() => Number, { nullable: true })
  userDetailId: number;

  @Column({
    name: 'templeId',
    type: 'int',
  })
  @Field(() => Number)
  templeId: number;

  @Column({
    name: 'familyId',
    type: 'int',
  })
  @Field(() => Number)
  familyId: number;

  @Column({ name: 'creatorId', type: 'int' })
  @Field(() => Number)
  creatorId: number;

  @Column({
    name: 'createdAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Field(() => String)
  createdAt: Date;

  @Column({
    name: 'updatedAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Field(() => String)
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
}
