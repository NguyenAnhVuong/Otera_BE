import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { formatPagingQuery } from 'src/helper/utils';

export const HasuraBodyPaging = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const hasuraBody = request.body.input;
    return formatPagingQuery(data ? hasuraBody?.[data] : hasuraBody);
  },
);
