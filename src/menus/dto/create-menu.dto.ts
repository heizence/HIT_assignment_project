// 메뉴 생성 시 데이터 형식을 정의하고 검사하는 dto
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsIn, Min, IsOptional } from 'class-validator';

const validCategories = ['한식', '중식', '일식', '양식', '기타'];

export class CreateMenuDto {
  @ApiProperty({ example: '오늘의 파스타', description: '메뉴 이름' })
  @IsString()
  name: string;

  @ApiProperty({ example: 15000, description: '메뉴 가격', minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @IsIn(validCategories)
  category: string;

  @IsString()
  @IsOptional()
  description?: string;
}
