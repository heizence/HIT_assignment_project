// 예약 수정 시 데이터 형식을 정의하고 검사하는 dto
import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ example: 1, description: '수정할 메뉴의 ID' })
  @IsInt()
  menuId: number;

  @ApiProperty({ example: 3, description: '수정할 메뉴의 수량', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class UpdateReservationDto {
  @ApiProperty({
    example: 4,
    description: '수정할 예약 인원수',
    minimum: 1,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  partySize?: number;

  @ApiProperty({
    type: [UpdateReservedMenuDto],
    description: '수정할 메뉴 목록 전체',
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateReservedMenuDto)
  @IsOptional()
  menus?: UpdateReservedMenuDto[];
}
