import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DeathAnniversary } from './deathAnniversary.entity';
import { Offering } from './offering.entity';

@ObjectType()
@Entity('deathAnniversaryOfferings')
export class DeathAnniversaryOffering {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'deathAnniversaryId', type: 'int' })
  @Field(() => Int)
  deathAnniversaryId: number;

  @Column({ name: 'offeringId', type: 'int' })
  @Field(() => Int)
  offeringId: number;

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

  @ManyToOne(
    () => DeathAnniversary,
    (deathAnniversary) => deathAnniversary.deathAnniversaryOfferings,
  )
  @JoinColumn({ name: 'deathAnniversaryId' })
  deathAnniversary: DeathAnniversary;

  @ManyToOne(() => Offering, (offering) => offering.deathAnniversaryOfferings)
  @JoinColumn({ name: 'offeringId' })
  offering: Offering;
}
