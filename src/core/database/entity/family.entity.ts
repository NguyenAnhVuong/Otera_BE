import { EStatus } from 'src/core/enum/default.enum';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { FamilyTemple } from './familyTemple.entity';
import { Deceased } from './deceased.entity';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { DeathAnniversary } from './deathAnniversary.entity';

@Entity('families')
@ObjectType()
export class Family {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({
    name: 'familyCode',
    type: 'varchar',
    length: 250,
    unique: true,
  })
  @Field(() => String)
  familyCode: string;

  @Column({ name: 'adminId', type: 'int' })
  @Field(() => Int)
  adminId: number;

  @Column({ name: 'name', type: 'varchar', length: 250 })
  @Field(() => String)
  name: string;

  @Column({ name: 'description', type: 'varchar', length: 1000 })
  @Field(() => String)
  description: string;

  @Column({ name: 'address', type: 'varchar', length: 250 })
  @Field(() => String)
  address: string;

  @Column({ name: 'phone', type: 'varchar', length: 20 })
  @Field(() => String)
  phone: string;

  @Column({ name: 'avatar', type: 'varchar', length: 250 })
  @Field(() => String)
  avatar: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: EStatus,
    default: EStatus.APPROVED,
  })
  @Field(() => EStatus, { defaultValue: EStatus.APPROVED })
  status: EStatus;

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

  @OneToMany(() => User, (user) => user.family)
  @Field(() => [User])
  users: User[];

  @OneToMany(() => Deceased, (deceased) => deceased.family)
  @Field(() => [Deceased])
  deceaseds: Deceased[];

  @OneToMany(() => FamilyTemple, (familyTemple) => familyTemple.family)
  @Field(() => [FamilyTemple])
  familyTemples: FamilyTemple[];

  @OneToMany(
    () => DeathAnniversary,
    (deathAnniversary) => deathAnniversary.family,
  )
  @Field(() => [DeathAnniversary])
  deathAnniversaries: DeathAnniversary[];
}
