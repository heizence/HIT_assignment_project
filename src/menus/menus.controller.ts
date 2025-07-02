// 메뉴 관련 API 요청을 받는 엔드포인트를 정의
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Query,
  Param,
  Delete,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { QueryMenuDto } from './dto/query-menu.dto';

@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Restaurant)
  create(@Body() createMenuDto: CreateMenuDto, @Req() req) {
    const restaurantId = req.user.userId;
    return this.menusService.create(createMenuDto, restaurantId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Restaurant)
  findAll(@Query() queryMenuDto: QueryMenuDto, @Req() req) {
    const restaurantId = req.user.userId;
    return this.menusService.findAllByRestaurant(restaurantId, queryMenuDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Restaurant)
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const restaurantId = req.user.userId;
    const result = await this.menusService.remove(id, restaurantId);
    if (!result) {
      throw new NotFoundException(
        `Menu with ID ${id} not found or you don't have permission.`,
      );
    }
    return { message: `Menu with ID ${id} has been successfully deleted.` };
  }
}
