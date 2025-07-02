// 로그인 API 엔드포인트를 정의
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'; // ApiBody 추가
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Role } from './roles.enum';

@ApiTags('Auth (인증)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login/customer')
  @ApiOperation({
    summary: '고객 로그인',
    description: '고객 계정으로 로그인하여 JWT 토큰을 발급받습니다.',
  })
  @ApiResponse({ status: 200, description: '로그인 성공, JWT 토큰 반환' })
  @ApiResponse({
    status: 401,
    description: '인증 실패 (계정 또는 비밀번호 불일치)',
  })
  customerLogin(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto, Role.Customer);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login/restaurant')
  @ApiOperation({
    summary: '식당 로그인',
    description: '식당 계정으로 로그인하여 JWT 토큰을 발급받습니다.',
  })
  @ApiResponse({ status: 200, description: '로그인 성공, JWT 토큰 반환' })
  @ApiResponse({
    status: 401,
    description: '인증 실패 (계정 또는 비밀번호 불일치)',
  })
  restaurantLogin(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto, Role.Restaurant);
  }
}
