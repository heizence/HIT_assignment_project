// 메뉴 조회 시 데이터 형식을 정의하고 검사하는 dto
import { IsString, IsNumberString, IsOptional } from 'class-validator';

export class QueryMenuDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumberString()
  @IsOptional()
  minPrice?: string;

  @IsNumberString()
  @IsOptional()
  maxPrice?: string;
}
