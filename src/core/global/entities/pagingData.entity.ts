import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PagingData {
  @Field(() => Int)
  totalItems: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  take: number;
}
