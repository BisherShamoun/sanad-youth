import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {} from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { UsersService } from './users.service.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CreateSupervisorDto } from './dto/create-supervisor.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { UserRole } from '../../generated/prisma/enums.js';
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}
  @Post('supervisors') @Roles(UserRole.ADMIN) createSupervisor(
    @Body() dto: CreateSupervisorDto,
  ) {
    return this.users.createSupervisor(dto);
  }
  @Get('me') me(@CurrentUser('id') id: number) {
    return this.users.getMe(id);
  }
}
