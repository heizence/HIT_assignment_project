// 예약 생성 시 데이터 형식을 정의하고 검사하는 dto
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsInt, Min, ValidateNested } from 'class-validator';

// 예약할 메뉴 정보를 담는 내부 DTO
class ReservedMenuDto {
  @ApiProperty({ example: 1, description: '예약할 메뉴의 ID' })
  @IsInt()
  menuId: number;

  @ApiProperty({ example: 2, description: '예약할 메뉴의 수량', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateReservationDto {
  @ApiProperty({ example: 1, description: '예약할 식당의 ID' })
  @IsInt()
  restaurantId: number;

  @ApiProperty({
    example: '2025-07-10T19:00:00.000Z',
    description: '예약 시작 시각 (ISO 8601 형식)',
  })
  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @ApiProperty({
    example: '2025-07-10T20:30:00.000Z',
    description: '예약 종료 시각 (ISO 8601 형식)',
  })
  @Type(() => Date)
  @IsDate()
  endTime: Date;

  @ApiProperty({ example: 2, description: '예약 인원수', minimum: 1 })
  @IsInt()
  @Min(1)
  partySize: number;

  @ApiProperty({ type: [ReservedMenuDto], description: '예약할 메뉴 목록' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReservedMenuDto)
  menus: ReservedMenuDto[];
}
