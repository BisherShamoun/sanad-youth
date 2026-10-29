import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CurrentUser, Roles } from '../common/decorators/index.js';
import { Role } from '../common/enums/index.js';
import { CreateSupervisorDto } from './dto/create-supervisor.dto.js';
import { ListUsersDto } from './dto/list-users.dto.js';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@CurrentUser('id') id: number) {
    return this.users.me(id);
  }

  @Roles(Role.ADMIN)
  @Post('supervisors')
  createSupervisor(@Body() dto: CreateSupervisorDto) {
    return this.users.createSupervisor(dto);
  }

  @Roles(Role.ADMIN)
  @Get()
  findAll(@Query() q: ListUsersDto) {
    return this.users.findAll(q);
  }
}
