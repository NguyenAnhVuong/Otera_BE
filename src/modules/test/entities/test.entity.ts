import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Test1 } from './test1.entity';

@ObjectType()
export class Test {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}

@ObjectType()
export class Test2 extends Test1 {
  @Field(() => Test, { description: 'Example field (placeholder)' })
  data: Test;
}
