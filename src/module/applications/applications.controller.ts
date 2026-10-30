import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync } from 'fs';
import {} from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { ApplicationsService } from './applications.service.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../generated/prisma/enums.js';
import { ReviewApplicationDto } from './dto/review-application.dto.js';

const uploadDir = process.env.UPLOAD_DIR || 'uploads';

mkdirSync(uploadDir, { recursive: true });
const cvOptions = {
  storage: diskStorage({
    destination: (
      _req: Request,
      _file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void,
    ) => {
      cb(null, uploadDir);
    },

    filename: (
      _req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      const filename =
        `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
        extname(file.originalname).toLowerCase();

      cb(null, filename);
    },
  }),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const extension = extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return cb(new BadRequestException('CV must be PDF, DOC, or DOCX'), false);
    }

    cb(null, true);
  },
};
@Controller('applications')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.ADMIN)
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}
  @Post(':programId')
  @UseInterceptors(FileInterceptor('cv', cvOptions))
  apply(
    @Param('programId', ParseIntPipe)
    programId: number,
    @CurrentUser('id')
    userId: number,
    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    return this.service.apply(programId, userId, file?.path);
  }
  @Get('mine')
  mine(
    @CurrentUser('id')
    userId: number,
  ) {
    return this.service.mine(userId);
  }
  @Patch(':id/cancel')
  cancel(
    @Param('id', ParseIntPipe)
    id: number,
    @CurrentUser('id')
    userId: number,
  ) {
    return this.service.cancel(id, userId);
  }
  @Get('program/:programId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERVISOR, UserRole.ADMIN)
  listForProgram(
    @Param('programId', ParseIntPipe)
    id: number,
    @CurrentUser()
    user: any,
  ) {
    return this.service.listForProgram(id, user.id, user.role);
  }
  @Patch(':id/review')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  review(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    dto: ReviewApplicationDto,
    @CurrentUser('id')
    adminId: number,
  ) {
    return this.service.review(id, dto, adminId);
  }
}
