import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ERole } from 'src/core/enum/default.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from './event.entity';

@Entity('eventParticipantTypes')
@ObjectType()
export class EventParticipantType {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'eventId', type: 'int' })
  @Field(() => Int)
  eventId: number;

  @Column({ name: 'role', type: 'enum', enum: ERole })
  @Field(() => ERole)
  role: ERole;

  @Column({ name: 'isDeleted', type: 'boolean', default: false })
  @Field(() => Boolean)
  isDeleted: boolean;

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

  @ManyToOne(() => Event, (event) => event.eventParticipantTypes)
  @JoinColumn({ name: 'eventId' })
  @Field(() => Event)
  event: Event;
}
