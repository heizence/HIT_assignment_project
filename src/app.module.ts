import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // 1. 환경 변수 모듈 설정
    ConfigModule.forRoot({
      isGlobal: true, // 모든 모듈에서 접근 가능하도록 설정
      envFilePath: '.env', // .env 파일 경로 지정
    }),
    // 2. TypeORM 모듈 설정 (비동기)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT'), 10),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'], // Entity 파일 자동 로드
        synchronize: true, // 개발 환경에서만 true로 설정 (DB 스키마 자동 동기화)
        logging: true, // SQL 쿼리 로그
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
