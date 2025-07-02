// 예약 관련 API 요청을 받는 엔드포인트를 정의
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  ParseIntPipe,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { QueryReservationDto } from './dto/query-reservation.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  // 고객: 예약 생성
  @Post()
  @Roles(Role.Customer)
  create(@Body() createReservationDto: CreateReservationDto, @Req() req) {
    const customerId = req.user.userId;
    return this.reservationsService.create(createReservationDto, customerId);
  }

  // 고객: 자신의 예약 목록 조회
  @Get('customer')
  @Roles(Role.Customer)
  findMyReservations(@Req() req) {
    const customerId = req.user.userId;
    return this.reservationsService.findAllByCustomer(customerId);
  }

  // 식당: 자신의 가게 예약 목록 조회 (필터링 포함)
  @Get('restaurant')
  @Roles(Role.Restaurant)
  findRestaurantReservations(@Query() query: QueryReservationDto, @Req() req) {
    const restaurantId = req.user.userId;
    return this.reservationsService.findAllByRestaurant(restaurantId, query);
  }

  // 고객: 자신의 예약 수정
  @Patch(':id')
  @Roles(Role.Customer)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReservationDto: UpdateReservationDto,
    @Req() req,
  ) {
    const customerId = req.user.userId;
    try {
      return await this.reservationsService.update(
        id,
        updateReservationDto,
        customerId,
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new Error(
        'An unexpected error occurred during reservation update.',
      );
    }
  }

  // 고객: 자신의 예약 취소
  @Delete(':id')
  @Roles(Role.Customer)
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const customerId = req.user.userId;
    try {
      await this.reservationsService.remove(id, customerId);
      return {
        message: `Reservation with ID ${id} has been successfully cancelled.`,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new Error(
        'An unexpected error occurred during reservation cancellation.',
      );
    }
  }
}
