import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const HasuraBody = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const hasuraBody = request.body.input;
    return data ? hasuraBody?.[data] : hasuraBody;
  },
);
