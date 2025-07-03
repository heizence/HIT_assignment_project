// 요청 헤더의 JWT 토큰을 해석하고 유효성을 검증하는 파일.
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserPayload } from './interfaces/user-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // 만료된 토큰은 거부
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  validate(payload: UserPayload) {
    // payload에는 토큰 생성 시 넣었던 정보(userId, login_id, role)가 담겨져 있음.
    if (!payload.role) {
      throw new UnauthorizedException('토큰에 역할 정보가 없습니다.');
    }
    return {
      userId: payload.sub,
      login_id: payload.login_id,
      role: payload.role,
    };
  }
}
