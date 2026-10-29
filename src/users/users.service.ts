import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSupervisorDto } from './dto/create-supervisor.dto.js';
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async createSupervisor(dto: CreateSupervisorDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email.toLowerCase() }, { username: dto.username }],
      },
    });
    if (existing)
      throw new ConflictException('Email or username is already in use');
    return this.prisma.user.create({
      data: {
        ...dto,
        email: dto.email.toLowerCase(),
        password: await bcrypt.hash(dto.password, 12),
        role: 'SUPERVISOR',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        role: true,
      },
    });
  }
  async getMe(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException();
    return user;
  }
}
