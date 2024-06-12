import { EValidationTokenType } from '@core/enum';
import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
