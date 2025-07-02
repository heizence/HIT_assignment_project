// 로그인 시 필요한 데이터 형식을 정의하고 유효성을 검사하는 dto
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  login_id: string;

  @IsString()
  @MinLength(4)
  password: string;
}
