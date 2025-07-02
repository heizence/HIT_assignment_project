// 실제 메뉴를 DB 에 생성, 조회, 삭제하는 로직을 처리하는 service
import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../entities/menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { QueryMenuDto } from './dto/query-menu.dto';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private readonly menusRepository: Repository<Menu>,
  ) {}

  create(createMenuDto: CreateMenuDto, restaurantId: number): Promise<Menu> {
    const menu = this.menusRepository.create({
      ...createMenuDto,
      restaurant_id: restaurantId,
    });
    return this.menusRepository.save(menu);
  }

  async findAllByRestaurant(
    restaurantId: number,
    query: QueryMenuDto,
  ): Promise<Menu[]> {
    const queryBuilder = this.menusRepository.createQueryBuilder('menu');

    queryBuilder.where('menu.restaurant_id = :restaurantId', { restaurantId });

    if (query.name) {
      queryBuilder.andWhere('menu.name LIKE :name', {
        name: `%${query.name}%`,
      });
    }
    if (query.minPrice) {
      queryBuilder.andWhere('menu.price >= :minPrice', {
        minPrice: query.minPrice,
      });
    }
    if (query.maxPrice) {
      queryBuilder.andWhere('menu.price <= :maxPrice', {
        maxPrice: query.maxPrice,
      });
    }

    return queryBuilder.getMany();
  }

  async remove(id: number, restaurantId: number): Promise<boolean> {
    const menu = await this.menusRepository.findOne({ where: { id } });

    if (!menu) {
      return false; // 메뉴가 없음
    }

    // 메뉴 소유권 확인
    if (menu.restaurant_id !== restaurantId) {
      throw new ForbiddenException(
        'You do not have permission to delete this menu.',
      );
    }

    const result = await this.menusRepository.delete(id);
    return !!result.affected && result.affected > 0;
  }
}
