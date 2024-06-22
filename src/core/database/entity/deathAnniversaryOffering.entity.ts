import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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

  @CreateDateColumn({
    name: 'createdAt',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updatedAt',
    type: 'timestamptz',
    default: null,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  @Field(() => Date, { nullable: true })
  updatedAt: Date;

  @ManyToOne(
    () => DeathAnniversary,
    (deathAnniversary) => deathAnniversary.deathAnniversaryOfferings,
  )
  @JoinColumn({ name: 'deathAnniversaryId' })
  @Field(() => DeathAnniversary)
  deathAnniversary: DeathAnniversary;

  @ManyToOne(() => Offering, (offering) => offering.deathAnniversaryOfferings)
  @JoinColumn({ name: 'offeringId' })
  @Field(() => Offering)
  offering: Offering;
}
