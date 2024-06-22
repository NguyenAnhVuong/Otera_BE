import { ENotificationType } from '@core/enum';
import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

registerEnumType(ENotificationType, {
  name: 'ENotificationType',
});

@Entity('notifications')
@ObjectType()
export class Notification {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'userId', type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  userId: number | null;

  @Column({ name: 'title', type: 'varchar', length: 250 })
  @Field(() => String)
  title: string;

  @Column({
    name: 'description',
    type: 'varchar',
    length: 1000,
    nullable: true,
  })
  @Field(() => String, { nullable: true })
  description: string | null;

  @Column({ name: 'type', type: 'enum', enum: ENotificationType })
  @Field(() => ENotificationType)
  type: ENotificationType;

  @Column({ name: 'inviteFamilyId', type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  inviteFamilyId: number | null;

  @Column({
    name: 'redirectTo',
    type: 'varchar',
    length: 250,
    nullable: true,
    comment: 'only router, not domain',
  })
  @Field(() => String, { nullable: true })
  redirectTo: string | null;

  @Column({ name: 'isRead', type: 'boolean', default: false })
  @Field(() => Boolean)
  isRead: boolean;

  @Column({ name: 'isDeleted', type: 'boolean', default: false })
  @Field(() => Boolean)
  isDeleted: boolean;

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
}
