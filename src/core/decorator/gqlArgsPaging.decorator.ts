import { formatPagingQuery } from '@helper/utils';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const GQLArgsPaging = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const args = GqlExecutionContext.create(ctx).getArgs();
    return formatPagingQuery(data ? args?.[data] : args);
  },
);
