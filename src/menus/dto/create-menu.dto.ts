// 메뉴 생성 시 데이터 형식을 정의하고 검사하는 dto
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsIn, Min, IsOptional } from 'class-validator';

const validCategories = ['한식', '중식', '일식', '양식', '기타'];

export class CreateMenuDto {
  @ApiProperty({
    example: '오늘의 파스타',
    description: '메뉴 이름',
  })
  @IsString()
  name: string;

  @ApiProperty({ example: 15000, description: '메뉴 가격', minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: '양식', description: '카테고리' })
  @IsIn(validCategories)
  category: string;

  @ApiProperty({
    example: '메뉴 설명(optional)',
    description: '메뉴에 대한 설명',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
