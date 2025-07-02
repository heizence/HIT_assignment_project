// 로그인 시 필요한 데이터 형식을 정의하고 유효성을 검사하는 dto
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'customer1', description: '로그인 ID' })
  @IsString()
  login_id: string;

  @ApiProperty({ example: 'testpassword', description: '비밀번호' })
  @IsString()
  @MinLength(4)
  password: string;
}
