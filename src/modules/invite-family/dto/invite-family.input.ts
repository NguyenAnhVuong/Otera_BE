import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';

@InputType()
export class InviteFamilyInput {
  @IsEmail()
  @Field(() => String)
  @IsNotEmpty()
  email: string;
}
