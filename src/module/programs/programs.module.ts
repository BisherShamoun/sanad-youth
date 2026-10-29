import { Module } from '@nestjs/common';
import { ProgramsService } from './programs.service.js';
import { ProgramsController } from './programs.controller.js';
import { CacheModule } from '@nestjs/cache-manager';
@Module({
  imports: [CacheModule.register({ ttl: 30000, max: 500 })],
  controllers: [ProgramsController],
  providers: [ProgramsService],
})
export class ProgramsModule {}
