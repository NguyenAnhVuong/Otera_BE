import { SetMetadata } from '@nestjs/common';
import { ERole } from 'src/core/enum/default.enum';

export const ROLE_KEYS = 'roles';
export const Roles = (roles: ERole[]) => SetMetadata(ROLE_KEYS, roles);
