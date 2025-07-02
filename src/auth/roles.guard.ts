// JwtAuthGuard 통과 후, API에 설정된 역할과 사용자의 역할이 맞는지 확인하는 가드.
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './roles.enum';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // @Roles() 데코레이터로 설정된 역할을 가져옵니다.
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 만약 API에 필요한 역할이 설정되어 있지 않다면, 누구나 접근 가능합니다.
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      return false;
    }
    // 사용자가 필요한 역할 중 하나라도 가지고 있는지 확인합니다.
    return requiredRoles.some((role) => user.role === role);
  }
}
