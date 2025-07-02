// 예약 생성 시 데이터 형식을 정의하고 검사하는 dto
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsInt, Min, ValidateNested } from 'class-validator';

// 예약할 메뉴 정보를 담는 내부 DTO
class ReservedMenuDto {
  @IsInt()
  menuId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateReservationDto {
  @IsInt()
  restaurantId: number;

  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @Type(() => Date)
  @IsDate()
  endTime: Date;

  @IsInt()
  @Min(1)
  partySize: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReservedMenuDto)
  menus: ReservedMenuDto[];
}
