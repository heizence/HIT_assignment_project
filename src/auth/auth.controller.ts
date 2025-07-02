// 로그인 API 엔드포인트를 정의
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Role } from './roles.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login/customer')
  customerLogin(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto, Role.Customer);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login/restaurant')
  restaurantLogin(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto, Role.Restaurant);
  }
}
