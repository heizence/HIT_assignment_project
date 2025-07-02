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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Menus (식당)') // API 그룹화 태그
@ApiBearerAuth() // 해당 컨트롤러의 모든 API에 자물쇠 아이콘 추가
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @ApiOperation({
    summary: '메뉴 생성',
    description: '식당 주인이 새로운 메뉴를 등록합니다.',
  })
  @ApiResponse({ status: 201, description: '메뉴 생성 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Restaurant)
  create(@Body() createMenuDto: CreateMenuDto, @Req() req) {
    const restaurantId = req.user.userId;
    return this.menusService.create(createMenuDto, restaurantId);
  }

  @Get()
  @ApiOperation({
    summary: '메뉴 목록 조회',
    description: '자신의 가게 메뉴 목록을 필터링하여 조회합니다.',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: '메뉴 이름 (부분 일치)',
  })
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
