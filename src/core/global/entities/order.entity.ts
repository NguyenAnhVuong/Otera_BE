import { ESortOrder } from '@core/enum';
import { Field, InputType, registerEnumType } from '@nestjs/graphql';

registerEnumType(ESortOrder, {
  name: 'ESortOrder',
});

@InputType()
export class OrderBy {
  @Field(() => String)
  column: string;

  @Field(() => ESortOrder)
  sortOrder: ESortOrder;
}
