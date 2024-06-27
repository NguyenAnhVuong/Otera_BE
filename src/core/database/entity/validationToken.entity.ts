import { EValidationTokenType } from '@core/enum';
import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

registerEnumType(EValidationTokenType, {
  name: 'EValidationTokenType',
});

@ObjectType()
@Entity('validationTokens')
export class ValidationToken {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'token', type: 'varchar', length: 255 })
  @Field(() => String)
  token: string;

  @Column({ name: 'type', type: 'enum', enum: EValidationTokenType })
  @Field(() => EValidationTokenType)
  type: EValidationTokenType;

  @Column({ name: 'email', type: 'varchar', length: 100 })
  @Field(() => String)
  email: string;

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

  @ManyToOne(() => User, (user) => user.validationTokens)
  @Field(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
