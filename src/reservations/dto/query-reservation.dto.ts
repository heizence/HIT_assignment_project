// 예약 조회 시 데이터 형식을 정의하고 검사하는 dto
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryReservationDto {
  @ApiProperty({
    required: false,
    description: '고객 전화번호 (부분 일치 검색)',
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string; // 전화번호 (일부) 검색

  @ApiProperty({
    required: false,
    example: '2025-07-10',
    description: '예약 날짜 (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsOptional()
  reservationDate?: string; // 특정 날짜 검색

  @ApiProperty({ required: false, description: '최소 예약 인원수' })
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  minPartySize?: number; // 최소 인원수 검색

  @ApiProperty({
    required: false,
    description: '포함된 메뉴 이름 (부분 일치 검색)',
  })
  @IsString()
  @IsOptional()
  menuName?: string; // 포함된 메뉴 이름 검색
}
