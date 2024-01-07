import { SetMetadata } from '@nestjs/common';
import { ERole } from 'src/core/enum/default.enum';

export const GRAPHQL_ROLE_KEYS = 'graphql_roles';
export const GraphQLRoles = (roles: ERole[]) =>
  SetMetadata(GRAPHQL_ROLE_KEYS, roles);
