import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ApplicationStatus } from '../../generated/prisma/enums.js';
@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}
  async upload(
    programId: number,
    title: string,
    file: Express.Multer.File,
    userId: number,
    role: string,
  ) {
    const p = await this.prisma.program.findUnique({
      where: { id: programId },
    });
    if (!p) throw new NotFoundException('Program not found');
    if (role !== 'ADMIN' && p.supervisorId !== userId)
      throw new ForbiddenException(
        'You can only manage materials for your own programs',
      );
    return this.prisma.material.create({
      data: {
        programId,
        title: title || file.originalname,
        filePath: file.path,
        mimeType: file.mimetype,
        size: file.size,
      },
    });
  }
  async getDownload(programId: number, materialId: number, userId: number) {
    const accepted = await this.prisma.application.findFirst({
      where: { programId, userId, status: ApplicationStatus.ACCEPTED },
    });
    if (!accepted)
      throw new ForbiddenException(
        'Only accepted participants can download materials',
      );
    const material = await this.prisma.material.findFirst({
      where: { id: materialId, programId },
    });
    if (!material) throw new NotFoundException('Material not found');
    return material;
  }
  async list(programId: number, userId: number) {
    const accepted = await this.prisma.application.findFirst({
      where: { programId, userId, status: ApplicationStatus.ACCEPTED },
    });
    if (!accepted)
      throw new ForbiddenException(
        'Only accepted participants can access materials',
      );
    return this.prisma.material.findMany({
      where: { programId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        filePath: true,
        mimeType: true,
        size: true,
        createdAt: true,
      },
    });
  }
}
