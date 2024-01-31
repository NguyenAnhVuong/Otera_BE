import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Family } from './family.entity';
import { Temple } from './temple.entity';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@Entity('familyTemples')
@ObjectType()
export class FamilyTemple {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'familyId', type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  familyId: number | null;

  @Column({ name: 'templeId', type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  templeId: number | null;

  @Column({
    name: 'createdAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Field(() => Date)
  createdAt: Date;

  @Column({
    name: 'updatedAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Field(() => Date)
  updatedAt: Date;

  @ManyToOne(() => Family, (family) => family.familyTemples)
  @JoinColumn({ name: 'familyId' })
  @Field(() => Family)
  family: Family;

  @ManyToOne(() => Temple, (temple) => temple.familyTemples)
  @JoinColumn({ name: 'templeId' })
  @Field(() => Temple)
  temple: Temple;
}
