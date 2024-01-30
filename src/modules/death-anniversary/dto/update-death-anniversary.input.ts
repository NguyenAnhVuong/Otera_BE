import { CreateDeathAnniversaryInput } from './create-death-anniversary.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateDeathAnniversaryInput extends PartialType(CreateDeathAnniversaryInput) {
  @Field(() => Int)
  id: number;
}
