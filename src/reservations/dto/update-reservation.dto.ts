// 예약 수정 시 데이터 형식을 정의하고 검사하는 dto
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';

// 예약 수정 시 메뉴 정보를 담는 내부 DTO
class UpdateReservedMenuDto {
  @IsInt()
  menuId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class UpdateReservationDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  partySize?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateReservedMenuDto)
  @IsOptional()
  menus?: UpdateReservedMenuDto[];
}
