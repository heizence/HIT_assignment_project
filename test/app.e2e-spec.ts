import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { DataSource, Repository } from 'typeorm';
import { Restaurant } from '../src/entities/restaurant.entity';
import { Customer } from '../src/entities/customer.entity';
import { Menu } from '../src/entities/menu.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});

describe('식당 예약 시스템 API (E2E 테스트)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let restaurantRepository: Repository<Restaurant>;
  let customerRepository: Repository<Customer>;
  let menuRepository: Repository<Menu>;

  let restaurantToken: string;
  let customer1Token: string;
  let customer2Token: string;

  let restaurant1: Restaurant;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    restaurantRepository = moduleFixture.get(getRepositoryToken(Restaurant));
    customerRepository = moduleFixture.get(getRepositoryToken(Customer));
    menuRepository = moduleFixture.get(getRepositoryToken(Menu));

    const restaurantLoginResponse = await request(app.getHttpServer())
      .post('/auth/login/restaurant')
      .send({ login_id: 'korean_diner', password: 'qwer1234!' });
    restaurantToken = restaurantLoginResponse.body.access_token;

    const customer1LoginResponse = await request(app.getHttpServer())
      .post('/auth/login/customer')
      .send({ login_id: 'user_kim', password: 'qwer1234!' });
    customer1Token = customer1LoginResponse.body.access_token;

    const customer2LoginResponse = await request(app.getHttpServer())
      .post('/auth/login/customer')
      .send({ login_id: 'user_lee', password: 'qwer1234!' });
    customer2Token = customer2LoginResponse.body.access_token;

    restaurant1 = (await restaurantRepository.findOneBy({
      login_id: 'korean_diner',
    }))!;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0;');
    await dataSource.query('TRUNCATE TABLE reservation_menus;');
    await dataSource.query('TRUNCATE TABLE reservations;');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1;');
  });

  describe('인증 (Auth)', () => {
    it('POST /auth/login/restaurant : 식당 계정으로 로그인 성공', () => {
      expect(restaurantToken).toBeDefined();
    });

    it('POST /auth/login/customer : 고객 계정으로 로그인 성공', () => {
      expect(customer1Token).toBeDefined();
    });

    it('POST /auth/login/customer : 잘못된 비밀번호로 로그인 실패 (401 Unauthorized)', async () => {
      return request(app.getHttpServer())
        .post('/auth/login/customer')
        .send({ login_id: 'user_kim', password: 'wrongpassword' })
        .expect(401);
    });
  });

  describe('메뉴 관리 (Menus)', () => {
    let createdMenuId: number;

    beforeEach(async () => {
      await menuRepository.delete({ restaurant_id: restaurant1.id });
      const menu = await menuRepository.save({
        name: '테스트용 갈비찜',
        price: 35000,
        category: '한식',
        restaurant_id: restaurant1.id,
      });
      createdMenuId = menu.id;
    });

    it('POST /menus : 식당 주인이 새로운 메뉴를 성공적으로 생성', async () => {
      const newMenu = {
        name: '신메뉴 해물파전',
        price: 18000,
        category: '한식',
      };
      await request(app.getHttpServer())
        .post('/menus')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send(newMenu)
        .expect(201)
        .then((res) => expect(res.body.name).toEqual(newMenu.name));
    });

    it('POST /menus : 고객이 메뉴 생성을 시도하면 실패 (403 Forbidden)', async () => {
      const newMenu = {
        name: '고객의 비밀메뉴',
        price: 10000,
        category: '기타',
      };
      await request(app.getHttpServer())
        .post('/menus')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send(newMenu)
        .expect(403);
    });

    it('GET /menus : 자신의 가게 메뉴 목록을 필터링하여 조회', async () => {
      await menuRepository.save({
        name: '특선 불고기',
        price: 25000,
        category: '한식',
        restaurant_id: restaurant1.id,
      });

      await request(app.getHttpServer())
        .get('/menus?name=갈비')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].name).toBe('테스트용 갈비찜');
        });

      await request(app.getHttpServer())
        .get('/menus?minPrice=30000&maxPrice=40000')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].price).toBe(35000);
        });
    });

    it('DELETE /menus/:id : 자신의 가게 메뉴를 삭제', async () => {
      await request(app.getHttpServer())
        .delete(`/menus/${createdMenuId}`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .expect(200);
    });
  });

  describe('예약 관리 (Reservations)', () => {
    // 예약 테스트에 필요한 메뉴를 이 테스트 그룹 내에서 직접 생성합
    let menu1: Menu;
    let menu2: Menu;

    beforeEach(async () => {
      // 각 예약 테스트 시작 전에 항상 메뉴를 새로 생성하여 독립성 보장
      await menuRepository.delete({ restaurant_id: restaurant1.id });

      menu1 = await menuRepository.save({
        name: '예약 테스트용 메뉴 1',
        price: 25000,
        category: '한식',
        restaurant_id: restaurant1.id,
      });
      menu2 = await menuRepository.save({
        name: '예약 테스트용 메뉴 2',
        price: 30000,
        category: '한식',
        restaurant_id: restaurant1.id,
      });
    });

    const validReservationTime = {
      startTime: '2025-12-24T19:00:00.000Z',
      endTime: '2025-12-24T20:30:00.000Z',
    };

    it('POST /reservations : 고객이 새로운 예약을 성공적으로 생성', async () => {
      const reservationData = {
        restaurantId: restaurant1.id,
        ...validReservationTime,
        partySize: 2,
        menus: [{ menuId: menu1.id, quantity: 2 }],
      };
      await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send(reservationData)
        .expect(201)
        .then((res) => expect(res.body.party_size).toBe(2));
    });

    it('POST /reservations : 과거 시간으로 예약 시도 시 실패 (400 Bad Request)', async () => {
      const reservationData = {
        restaurantId: restaurant1.id,
        startTime: '2020-01-01T19:00:00.000Z',
        endTime: '2020-01-01T20:30:00.000Z',
        partySize: 2,
        menus: [{ menuId: menu1.id, quantity: 1 }],
      };
      await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send(reservationData)
        .expect(400);
    });

    it('POST /reservations : 종료 시간이 시작 시간보다 빠를 경우 실패 (400 Bad Request)', async () => {
      const reservationData = {
        restaurantId: restaurant1.id,
        startTime: '2025-12-25T20:30:00.000Z',
        endTime: '2025-12-25T19:00:00.000Z',
        partySize: 2,
        menus: [{ menuId: menu1.id, quantity: 1 }],
      };
      await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send(reservationData)
        .expect(400);
    });

    it('GET /reservations/customer : 고객이 자신의 예약 목록을 조회', async () => {
      await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          restaurantId: restaurant1.id,
          ...validReservationTime,
          partySize: 2,
          menus: [{ menuId: menu1.id, quantity: 1 }],
        });
      await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          restaurantId: restaurant1.id,
          startTime: '2025-12-26T19:00:00.000Z',
          endTime: '2025-12-26T20:30:00.000Z',
          partySize: 4,
          menus: [{ menuId: menu2.id, quantity: 2 }],
        });

      await request(app.getHttpServer())
        .get('/reservations/customer')
        .set('Authorization', `Bearer ${customer1Token}`)
        .expect(200)
        .then((res) => expect(res.body).toHaveLength(2));
    });

    it('GET /reservations/restaurant : 식당 주인이 가게의 예약 목록을 조회', async () => {
      await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          restaurantId: restaurant1.id,
          ...validReservationTime,
          partySize: 2,
          menus: [{ menuId: menu1.id, quantity: 1 }],
        });
      await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${customer2Token}`)
        .send({
          restaurantId: restaurant1.id,
          startTime: '2025-12-26T19:00:00.000Z',
          endTime: '2025-12-26T20:30:00.000Z',
          partySize: 4,
          menus: [{ menuId: menu2.id, quantity: 2 }],
        });

      await request(app.getHttpServer())
        .get('/reservations/restaurant')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .expect(200)
        .then((res) => expect(res.body).toHaveLength(2));

      await request(app.getHttpServer())
        .get(`/reservations/restaurant?phoneNumber=1111`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].customer.name).toBe('김민준');
        });
    });

    it('PATCH /reservations/:id : 고객이 자신의 예약을 수정', async () => {
      const reservation = await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          restaurantId: restaurant1.id,
          ...validReservationTime,
          partySize: 2,
          menus: [{ menuId: menu1.id, quantity: 1 }],
        });

      const reservationId = reservation.body.id;
      const updateData = { partySize: 4 };

      await request(app.getHttpServer())
        .patch(`/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${customer1Token}`)
        .send(updateData)
        .expect(200)
        .then((res) => expect(res.body.party_size).toBe(4));
    });

    it('PATCH /reservations/:id : 다른 고객의 예약을 수정 시도 시 실패 (403 Forbidden)', async () => {
      const reservation = await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          restaurantId: restaurant1.id,
          ...validReservationTime,
          partySize: 2,
          menus: [{ menuId: menu1.id, quantity: 1 }],
        });

      const reservationId = reservation.body.id;
      const updateData = { partySize: 4 };

      await request(app.getHttpServer())
        .patch(`/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${customer2Token}`)
        .send(updateData)
        .expect(403);
    });

    it('DELETE /reservations/:id : 고객이 자신의 예약을 취소', async () => {
      const reservation = await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          restaurantId: restaurant1.id,
          ...validReservationTime,
          partySize: 2,
          menus: [{ menuId: menu1.id, quantity: 1 }],
        });
      const reservationId = reservation.body.id;

      await request(app.getHttpServer())
        .delete(`/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${customer1Token}`)
        .expect(200);
    });
  });
});
