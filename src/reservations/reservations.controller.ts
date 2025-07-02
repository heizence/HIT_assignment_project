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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { QueryReservationDto } from './dto/query-reservation.dto';

@ApiTags('Reservations (예약)')
@ApiBearerAuth() // 이 컨트롤러의 모든 API는 인증 토큰이 필요함을 명시
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  // 고객: 예약 생성
  @Post()
  @Roles(Role.Customer)
  @ApiOperation({
    summary: '예약 생성 (고객용)',
    description: '고객이 식당에 예약을 생성합니다.',
  })
  @ApiResponse({ status: 201, description: '예약 생성 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 409, description: '예약 시간 중복' })
  create(@Body() createReservationDto: CreateReservationDto, @Req() req) {
    const customerId = req.user.userId;
    return this.reservationsService.create(createReservationDto, customerId);
  }

  // 고객: 자신의 예약 목록 조회
  @Get('customer')
  @Roles(Role.Customer)
  @ApiOperation({
    summary: '나의 예약 목록 조회 (고객용)',
    description: '고객이 자신의 예약 내역을 모두 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '조회 성공' })
  findMyReservations(@Req() req) {
    const customerId = req.user.userId;
    return this.reservationsService.findAllByCustomer(customerId);
  }

  // 식당: 자신의 가게 예약 목록 조회 (필터링 포함)
  @Get('restaurant')
  @Roles(Role.Restaurant)
  @ApiOperation({
    summary: '가게 예약 목록 조회 (식당용)',
    description: '식당 주인이 자신의 가게 예약 내역을 필터링하여 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '조회 성공' })
  findRestaurantReservations(@Query() query: QueryReservationDto, @Req() req) {
    const restaurantId = req.user.userId;
    return this.reservationsService.findAllByRestaurant(restaurantId, query);
  }

  // 고객: 자신의 예약 수정
  @Patch(':id')
  @Roles(Role.Customer)
  @ApiOperation({
    summary: '예약 수정 (고객용)',
    description: '고객이 자신의 예약을 수정합니다 (인원수, 메뉴).',
  })
  @ApiResponse({ status: 200, description: '수정 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '예약을 찾을 수 없음' })
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
  @ApiOperation({
    summary: '예약 취소 (고객용)',
    description: '고객이 자신의 예약을 취소합니다.',
  })
  @ApiResponse({ status: 200, description: '취소 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '예약을 찾을 수 없음' })
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
