import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Body,
  StreamableFile,
} from '@nestjs/common';

import type { Request } from 'express';
import { diskStorage, FileFilterCallback } from 'multer';

import { createReadStream } from 'fs';
import { extname } from 'path';
import { mkdirSync } from 'fs';
import {} from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { MaterialsService } from './materials.service.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { UserRole } from '../../generated/prisma/enums.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { FileInterceptor } from '@nestjs/platform-express';

// const dir = process.env.UPLOAD_DIR || 'uploads';
// mkdirSync(dir, { recursive: true });

// const opts = {
//   storage: diskStorage({
//     destination: (
//       _req: Request,
//       _file: Express.Multer.File,
//       cb: (error: Error | null, destination: string) => void,
//     ) => {
//       cb(null, dir);
//     },

//     filename: (
//       _req: Request,
//       file: Express.Multer.File,
//       cb: (error: Error | null, filename: string) => void,
//     ) => {
//       cb(
//         null,
//         `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(
//           file.originalname,
//         ).toLowerCase()}`,
//       );
//     },
//   }),

//   limits: {
//     fileSize: 20 * 1024 * 1024,
//   },

//   fileFilter: (
//     _req: Request,
//     file: Express.Multer.File,
//     cb: FileFilterCallback,
//   ) => {
//     const allowedExtensions = [
//       '.pdf',
//       '.doc',
//       '.docx',
//       '.ppt',
//       '.pptx',
//       '.zip',
//     ];

//     const extension = extname(file.originalname).toLowerCase();
//     const allowed = allowedExtensions.includes(extension);

//     if (!allowed) {
//       return cb(new BadRequestException('Unsupported material file type'));
//     }

//     cb(null, true);
//   },
// };
// // const opts = {
// //   storage: diskStorage({
// //     destination: dir,
// //     filename: (_r, f, cb) =>
// //       cb(
// //         null,
// //         `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(f.originalname).toLowerCase()}`,
// //       ),
// //   }),
// //   limits: { fileSize: 20 * 1024 * 1024 },
// //   fileFilter: (_r, f, cb) => {
// //     const ok = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.zip'].includes(
// //       extname(f.originalname).toLowerCase(),
// //     );
// //     cb(
// //       ok ? null : new BadRequestException('Unsupported material file type'),
// //       ok,
// //     );
// //   },
// // };
// @Controller('programs/:programId/materials')
// @UseGuards(JwtAuthGuard)
// export class MaterialsController {
//   constructor(private readonly service: MaterialsService) {}
//   @Get() list(
//     @Param('programId', ParseIntPipe) id: number,
//     @CurrentUser('id') userId: number,
//   ) {
//     return this.service.list(id, userId);
//   }
//   @Get(':materialId/download') async download(
//     @Param('programId', ParseIntPipe) programId: number,
//     @Param('materialId', ParseIntPipe) materialId: number,
//     @CurrentUser('id') userId: number,
//   ) {
//     const material = await this.service.getDownload(
//       programId,
//       materialId,
//       userId,
//     );
//     return new StreamableFile(createReadStream(material.filePath), {
//       type: material.mimeType,
//       disposition: 'attachment',
//     });
//   }
//   @Post()
//   @UseGuards(RolesGuard)
//   @Roles(UserRole.SUPERVISOR, UserRole.ADMIN)
//   @UseInterceptors(FileInterceptor('file', opts))
//   upload(
//     @Param('programId', ParseIntPipe) id: number,
//     @Body('title') title: string,
//     @UploadedFile() file: Express.Multer.File,
//     @CurrentUser() user: any,
//   ) {
//     if (!file) throw new BadRequestException('File is required');
//     return this.service.upload(id, title, file, user.id, user.role);
//   }
// }

const dir = process.env.UPLOAD_DIR || 'uploads';

mkdirSync(dir, { recursive: true });

const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.zip'];

const opts = {
  storage: diskStorage({
    destination: (
      _req: Request,
      _file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void,
    ) => {
      cb(null, dir);
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
    fileSize: 20 * 1024 * 1024,
  },

  fileFilter: (
    _req: any,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const extension = extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return cb(
        new BadRequestException('Unsupported material file type'),
        false,
      );
    }

    cb(null, true);
  },
};

@Controller('programs/:programId/materials')
@UseGuards(JwtAuthGuard)
export class MaterialsController {
  constructor(private readonly service: MaterialsService) {}

  @Get()
  list(
    @Param('programId', ParseIntPipe) programId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.service.list(programId, userId);
  }

  @Get(':materialId/download')
  async download(
    @Param('programId', ParseIntPipe) programId: number,
    @Param('materialId', ParseIntPipe) materialId: number,
    @CurrentUser('id') userId: number,
  ) {
    const material = await this.service.getDownload(
      programId,
      materialId,
      userId,
    );

    return new StreamableFile(createReadStream(material.filePath), {
      type: material.mimeType,
      disposition: 'attachment',
    });
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERVISOR, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', opts))
  upload(
    @Param('programId', ParseIntPipe) programId: number,
    @Body('title') title: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!title || !title.trim()) {
      throw new BadRequestException('Material title is required');
    }

    return this.service.upload(
      programId,
      title.trim(),
      file,
      user.id,
      user.role,
    );
  }
}
