import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DeathAnniversaryOffering } from './deathAnniversaryOffering.entity';

@ObjectType()
@Entity('offerings')
export class Offering {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  @Field(() => String)
  name: string;

  @Column({ name: 'image', type: 'varchar', length: 255 })
  @Field(() => String)
  image: string;

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

  @OneToMany(
    () => DeathAnniversaryOffering,
    (deathAnniversaryOffering) => deathAnniversaryOffering.offering,
  )
  @Field(() => [DeathAnniversaryOffering])
  deathAnniversaryOfferings: DeathAnniversaryOffering[];
}
