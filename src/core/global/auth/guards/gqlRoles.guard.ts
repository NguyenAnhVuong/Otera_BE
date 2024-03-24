import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ERole } from 'src/core/enum/default.enum';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GRAPHQL_ROLE_KEYS } from '@core/decorator/gqlRoles.decorator';

@Injectable()
export class GQLRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ERole[]>(
      GRAPHQL_ROLE_KEYS,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = this.getRequest(context);
    return requiredRoles.some((role) => user.role === role);
  }
}
