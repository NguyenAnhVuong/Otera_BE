import { EGender } from 'src/core/enum/default.enum';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Deceased } from './deceased.entity';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import 'dotenv/config.js';

registerEnumType(EGender, {
  name: 'EGender',
});

@Entity('user_details')
@ObjectType()
export class UserDetail {
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  id: number;

  @Column({
    name: 'avatar',
    type: 'varchar',
    length: 250,
    default: process.env.APP_URL + '/avatar-default.png',
  })
  @Field(() => String)
  avatar: string;

  @Column({ name: 'name', type: 'varchar', length: 500 })
  @Field(() => String)
  name: string;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  @Field(() => String, { nullable: true })
  phone: string | null;

  @Column({ name: 'birthday', type: 'date' })
  @Field(() => Date)
  birthday: Date;

  @Column({ name: 'address', type: 'varchar', length: 500, nullable: true })
  @Field(() => String, { nullable: true })
  address: string | null;

  @Column({
    name: 'gender',
    type: 'enum',
    enum: EGender,
    default: EGender.MALE,
  })
  @Field(() => EGender, { defaultValue: EGender.MALE })
  gender: EGender;

  @Column({
    name: 'citizen_number',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  @Field(() => String, { nullable: true })
  citizenNumber: string | null;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Field(() => Date)
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Field(() => Date)
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.userDetail)
  @Field(() => User)
  user: User;

  @OneToOne(() => Deceased, (deceased) => deceased.userDetail)
  deceased: Deceased;
}
