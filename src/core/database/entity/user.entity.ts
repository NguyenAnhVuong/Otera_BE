import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ERole } from 'src/core/enum/default.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DeathAnniversary } from './deathAnniversary.entity';
import { Family } from './family.entity';
import { Review } from './review.entity';
import { Temple } from './temple.entity';
import { TempleMember } from './templeMember.entity';
import { UserDetail } from './userDetail.entity';

registerEnumType(ERole, {
  name: 'ERole',
});
@Entity('users')
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'email', type: 'varchar', length: 100 })
  @Field(() => String)
  email: string;

  @Column({ name: 'password', type: 'varchar', length: 100 })
  password: string;

  @Column({
    name: 'role',
    type: 'enum',
    enum: ERole,
    default: ERole.PUBLIC_USER,
  })
  @Field(() => ERole, { defaultValue: ERole.PUBLIC_USER })
  role: ERole;

  @Column({ name: 'refreshToken', type: 'text', nullable: true })
  @Field(() => String, { nullable: true })
  refreshToken: string | null;

  @Column({ name: 'familyId', type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  familyId: number | null;

  @Column({ name: 'userDetailId', type: 'int', nullable: true })
  @Field(() => Int, { nullable: true })
  userDetailId: number | null;

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

  @OneToOne(() => Temple, (temple) => temple.admin)
  @Field(() => Temple)
  temple: Temple;

  @OneToOne(() => UserDetail, (userDetail) => userDetail.user)
  @JoinColumn({ name: 'userDetailId' })
  @Field(() => UserDetail)
  userDetail: UserDetail;

  @ManyToOne(() => Family, (family) => family.users)
  @JoinColumn({ name: 'familyId' })
  family: Family;

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(
    () => DeathAnniversary,
    (deathAnniversary) => deathAnniversary.user,
  )
  deathAnniversaries: DeathAnniversary[];

  @OneToOne(() => TempleMember, (templeMember) => templeMember.user)
  templeMember: TempleMember;
}
