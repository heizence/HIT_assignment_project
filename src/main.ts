// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // swagger import 추가

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 속성은 자동으로 제거
      forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 들어오면 에러 발생
      transform: true, // 들어오는 데이터를 DTO 클래스 타입으로 변환
    }),
  );

  // --- Swagger 설정 추가 ---
  const config = new DocumentBuilder()
    .setTitle('식당 예약 시스템 API')
    .setDescription('NestJS 기반 식당 예약 시스템 API 명세서')
    .setVersion('1.0')
    .addBearerAuth() // JWT 인증을 위한 BearerAuth 추가
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // 'api' 경로에 Swagger UI 생성
  // -------------------------

  await app.listen(3000);
}
bootstrap();
