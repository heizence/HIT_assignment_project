// 예약 기능에 관련된 모든 구성요소들을 묶어서 관리하는 모듈
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { Reservation } from '../entities/reservation.entity';
import { ReservationMenu } from '../entities/reservation-menu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, ReservationMenu])],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
