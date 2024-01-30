import { EPlan, EPriority, EStatus } from 'src/core/enum/default.enum';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { FamilyTemple } from './familyTemple.entity';
import { Image } from './image.entity';
import { Deceased } from './deceased.entity';
import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Review } from './review.entity';

registerEnumType(EPriority, {
  name: 'EPriority',
});
registerEnumType(EPlan, {
  name: 'EPlan',
});
registerEnumType(EStatus, {
  name: 'EStatus',
});
@Entity('temples')
@ObjectType()
export class Temple {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 250 })
  @Field(() => String)
  name: string;

  @Column({ name: 'avatar', type: 'varchar', length: 250 })
  @Field(() => String)
  avatar: string;

  @Column({ name: 'address', type: 'varchar', length: 250 })
  @Field(() => String)
  address: string;

  @Column({ name: 'description', type: 'varchar', length: 5000 })
  description: string;

  @Column({ name: 'phone', type: 'varchar', length: 250, nullable: true })
  @Field(() => String, { nullable: true })
  phone: string | null;

  @Column({ name: 'email', type: 'varchar', length: 250, nullable: true })
  @Field(() => String, { nullable: true })
  email: string;

  @Column({ name: 'website', type: 'varchar', length: 250, nullable: true })
  @Field(() => String, { nullable: true })
  website: string | null;

  @Column({
    name: 'priority',
    type: 'enum',
    enum: EPriority,
    default: EPriority.MEDIUM,
  })
  @Field(() => EPriority, { defaultValue: EPriority.MEDIUM })
  priority: EPriority;

  @Column({ name: 'priorityExpired', type: 'date', nullable: true })
  @Field(() => Date, { nullable: true })
  priorityExpired: Date | null;

  @Column({ name: 'plan', type: 'enum', enum: EPlan, default: EPlan.FREE })
  @Field(() => EPlan, { defaultValue: EPlan.FREE })
  plan: EPlan;

  @Column({ name: 'planExpired', type: 'date', nullable: true })
  @Field(() => Date, { nullable: true })
  planExpired: Date | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: EStatus,
    default: EStatus.ACTIVE,
  })
  @Field(() => EStatus, { defaultValue: EStatus.ACTIVE })
  status: EStatus;

  @Column({ name: 'adminId', type: 'int' })
  @Field(() => Int)
  adminId: number;

  @Column({
    name: 'createdAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Field(() => String)
  createdAt: Date;

  @Column({
    name: 'updatedAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Field(() => String)
  updatedAt: Date;

  @OneToMany(() => Deceased, (deceased) => deceased.temple)
  @Field(() => [Deceased])
  deceaseds: Deceased[];

  @OneToMany(() => FamilyTemple, (familyTemple) => familyTemple.temple)
  @Field(() => [FamilyTemple])
  familyTemples: FamilyTemple[];

  @OneToMany(() => Image, (image) => image.temple)
  @Field(() => [Image])
  images: Image[];

  @OneToMany(() => Review, (review) => review.temple)
  @Field(() => [Review])
  reviews: Review[];
}
