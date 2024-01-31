import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Deceased } from './deceased.entity';
import { Temple } from './temple.entity';
import { Event } from './event.entity';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@Entity('images')
@ObjectType()
export class Image {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'deceasedId', type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  deceasedId: number | null;

  @Column({ name: 'templeId', type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  templeId: number | null;

  @Column({ name: 'eventId', type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  eventId: number | null;

  @Column({ name: 'image', type: 'varchar', length: 255 })
  @Field(() => String)
  image: string;

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

  @ManyToOne(() => Deceased, (deceased) => deceased.images)
  @JoinColumn({ name: 'deceasedId' })
  @Field(() => Deceased)
  deceased: Deceased;

  @ManyToOne(() => Temple, (temple) => temple.images)
  @JoinColumn({ name: 'templeId' })
  @Field(() => Temple)
  temple: Temple;

  @ManyToOne(() => Event, (event) => event.images)
  @JoinColumn({ name: 'eventId' })
  @Field(() => Event)
  event: Event;
}
