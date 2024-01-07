import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Test } from './test.entity';

@ObjectType()
export class Test1 {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  statusCode: number;
  @Field(() => String, {
    description: 'Example field (placeholder)',
    nullable: true,
  })
  errorMessage: string;
  @Field(() => String, {
    description: 'Example field (placeholder)',
    nullable: true,
  })
  errorCode: string;
  @Field(() => String, { description: 'Example field (placeholder)' })
  timestamp: string;
}
