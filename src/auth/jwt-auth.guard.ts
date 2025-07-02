// JWT 토큰이 유효한지 가장 먼저 확인하는 가드. Passport의 'jwt' 전략을 사용
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
