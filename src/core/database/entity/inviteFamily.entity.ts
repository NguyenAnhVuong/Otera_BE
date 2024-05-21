import { EStatus } from '@core/enum';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('inviteFamilies')
@ObjectType()
export class InviteFamily {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'familyId', type: 'int' })
  @Field(() => Int)
  familyId: number;

  @Column({ name: 'userId', type: 'int' })
  @Field(() => Int)
  userId: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: EStatus,
    default: EStatus.PENDING,
  })
  @Field(() => EStatus, { defaultValue: EStatus.PENDING })
  status: EStatus;

  @Column({
    name: 'isDeleted',
    type: 'boolean',
    default: false,
  })
  @Field(() => Boolean)
  isDeleted: boolean;

  @Column({
    name: 'expiredAt',
    type: 'timestamp',
  })
  @Field(() => Date)
  expiredAt: Date;

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
}
