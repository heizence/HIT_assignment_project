// 메뉴 생성 시 데이터 형식을 정의하고 검사하는 dto
import { IsString, IsNumber, IsIn, Min, IsOptional } from 'class-validator';

const validCategories = ['한식', '중식', '일식', '양식', '기타'];

export class CreateMenuDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsIn(validCategories)
  category: string;

  @IsString()
  @IsOptional()
  description?: string;
}
