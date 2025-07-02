// 고객 관련 컴포넌트들을 하나로 묶어서 관리하는 모듈
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../entities/customer.entity';
import { CustomersService } from './customers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  providers: [CustomersService],
  exports: [CustomersService], // 다른 모듈에서 사용 가능하도록 export
})
export class CustomersModule {}
