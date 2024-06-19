import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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

  @OneToMany(
    () => DeathAnniversaryOffering,
    (deathAnniversaryOffering) => deathAnniversaryOffering.offering,
  )
  @Field(() => [DeathAnniversaryOffering])
  deathAnniversaryOfferings: DeathAnniversaryOffering[];
}
