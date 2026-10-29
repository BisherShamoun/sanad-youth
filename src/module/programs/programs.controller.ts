import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {} from '@prisma/client';
import { ProgramsService } from './programs.service.js';
import { ListProgramsDto } from './dto/list-programs.dto.js';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { UserRole } from '../../generated/prisma/enums.js';
import { CreateProgramDto } from './dto/create-program.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { CreateSessionDto } from './dto/create-session.dto.js';
import { UpdateProgramDto } from './dto/update-program.dto.js';
@Controller('programs')
export class ProgramsController {
  constructor(private readonly programs: ProgramsService) {}
  @Get() list(@Query() query: ListProgramsDto) {
    return this.programs.list(query);
  }
  @Get(':id') get(@Param('id', ParseIntPipe) id: number) {
    return this.programs.get(id);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERVISOR)
  @Post()
  create(
    @Body() dto: CreateProgramDto,
    @CurrentUser('id') supervisorId: number,
  ) {
    return this.programs.create(dto, supervisorId);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERVISOR)
  @Post(':id/sessions')
  addSession(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    dto: CreateSessionDto,
    @CurrentUser()
    user: any,
  ) {
    return this.programs.addSession(id, dto, user.id, user.role);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERVISOR)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    dto: UpdateProgramDto,
    @CurrentUser()
    user: any,
  ) {
    return this.programs.update(id, dto, user.id, user.role);
  }
}
