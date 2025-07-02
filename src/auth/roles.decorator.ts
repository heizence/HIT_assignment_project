// Controller의 각 API에 필요한 역할을 메타데이터로 설정하는 커스텀 decorator
// 예: @Roles(Role.Restaurant)
import { SetMetadata } from '@nestjs/common';
import { Role } from './roles.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
