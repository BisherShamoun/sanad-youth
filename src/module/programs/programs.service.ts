import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { PrismaService } from '../../prisma/prisma.service.js';
import { ListProgramsDto } from './dto/list-programs.dto.js';
import { CreateProgramDto } from './dto/create-program.dto.js';
import { CreateSessionDto } from './dto/create-session.dto.js';
import { UpdateProgramDto } from './dto/update-program.dto.js';
@Injectable()
export class ProgramsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER)
    private cache: Cache,
  ) {}
  async list(q: ListProgramsDto) {
    const page = q.page || 1,
      limit = q.limit || 10;
    const where: any = { status: 'PUBLISHED' };
    if (q.search)
      where.OR = [
        { title: { contains: q.search, mode: 'insensitive' } },
        { description: { contains: q.search, mode: 'insensitive' } },
      ];
    const key = `programs:${JSON.stringify({ ...q, page, limit })}`;
    const cached = await this.cache.get(key);

    if (cached) return cached;

    const [data, total] = await Promise.all([
      this.prisma.program.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [q.sortBy || 'createdAt']: q.sortOrder || 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          imagePath: true,
          capacity: true,
          availableSeats: true,
          status: true,
          supervisor: { select: { id: true, firstName: true, lastName: true } },
          sessions: { orderBy: { startsAt: 'asc' } },
        },
      }),
      this.prisma.program.count({ where }),
    ]);
    const result = {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
    await this.cache.set(key, result, 30000);
    return result;
  }
  async get(id: number) {
    const p = await this.prisma.program.findFirst({
      where: { id, status: 'PUBLISHED' },
      include: {
        supervisor: { select: { id: true, firstName: true, lastName: true } },
        sessions: { orderBy: { startsAt: 'asc' } },
      },
    });
    if (!p) throw new NotFoundException('Program not found');
    return p;
  }
  async create(dto: CreateProgramDto, supervisorId: number) {
    return this.prisma.program.create({
      data: {
        ...dto,
        availableSeats: dto.capacity,
        supervisorId,
        status: 'DRAFT',
      },
    });
  }
  async addSession(
    id: number,
    dto: CreateSessionDto,
    userId: number,
    role: string,
  ) {
    const p = await this.prisma.program.findUnique({ where: { id } });

    if (!p) throw new NotFoundException('Program not found');

    if (role !== 'ADMIN' && p.supervisorId !== userId)
      throw new ForbiddenException('You can only manage your own programs');

    if (new Date(dto.endsAt) <= new Date(dto.startsAt))
      throw new BadRequestException('endsAt must be after startsAt');

    return this.prisma.programSession.create({
      data: {
        programId: id,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        location: dto.location,
        meetingUrl: dto.meetingUrl,
      },
    });
  }
  async update(
    id: number,
    dto: UpdateProgramDto,
    userId: number,
    role: string,
  ) {
    const p = await this.prisma.program.findUnique({ where: { id } });

    if (!p) throw new NotFoundException('Program not found');

    if (role !== 'ADMIN' && p.supervisorId !== userId)
      throw new ForbiddenException('You can only manage your own programs');

    if (
      dto.capacity !== undefined &&
      dto.capacity < p.capacity - p.availableSeats
    )
      throw new BadRequestException(
        'Capacity cannot be lower than already reserved seats',
      );
    const data: any = { ...dto };

    if (dto.capacity !== undefined)
      data.availableSeats = p.availableSeats + (dto.capacity - p.capacity);
    const updated = await this.prisma.program.update({ where: { id }, data });
    await this.cache.clear();
    return updated;
  }
}
