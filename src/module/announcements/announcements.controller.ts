import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {} from '@prisma/client';
import { AnnouncementsService } from './announcements.service.js';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { UserRole } from '../../generated/prisma/enums.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CreateAnnouncementDto } from './dto/create-announcement.dto.js';
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly service: AnnouncementsService) {}
  @Get()
  @UseGuards(JwtAuthGuard)
  list(
    @CurrentUser('id')
    userId: number,
  ) {
    return this.service.listForUser(userId);
  }
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  create(
    @Body()
    dto: CreateAnnouncementDto,
    @CurrentUser()
    user: any,
  ) {
    return this.service.create(dto, user.id, user.role);
  }
}
