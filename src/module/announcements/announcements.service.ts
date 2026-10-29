import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateAnnouncementDto } from './dto/create-announcement.dto.js';
@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreateAnnouncementDto, authorId: number, role: string) {
    if (dto.scope === 'GENERAL' && role !== 'ADMIN')
      throw new ForbiddenException(
        'Only admins can create general announcements',
      );
    if (dto.scope === 'PROGRAM' && !dto.programId)
      throw new BadRequestException(
        'programId is required for program announcements',
      );
    if (dto.programId) {
      const p = await this.prisma.program.findUnique({
        where: { id: dto.programId },
      });
      if (!p) throw new NotFoundException('Program not found');
      if (role !== 'ADMIN' && p.supervisorId !== authorId)
        throw new ForbiddenException('You can only post to your own programs');
    }
    return this.prisma.announcement.create({
      data: {
        title: dto.title,
        body: dto.body,
        scope: dto.scope,
        programId: dto.programId,
        authorId,
      },
    });
  }
  async listForUser(userId: number) {
    const enrolled = await this.prisma.application.findMany({
      where: { userId, status: { in: ['PENDING', 'ACCEPTED'] } },
      select: { programId: true },
    });
    const ids = enrolled.map((a) => a.programId);
    return this.prisma.announcement.findMany({
      where: {
        OR: [
          { scope: 'GENERAL' },
          { scope: 'PROGRAM', programId: { in: ids } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        program: { select: { id: true, title: true } },
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }
}
