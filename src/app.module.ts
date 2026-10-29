import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './module/users/users.module.js';
import { MaterialsModule } from './module/materials/materials.module.js';
import { AnnouncementsModule } from './module/announcements/announcements.module.js';
import { ApplicationsModule } from './module/applications/applications.module.js';
import { ProgramsModule } from './module/programs/programs.module.js';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    CacheModule.register({ isGlobal: true, ttl: 10_000 }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProgramsModule,
    ApplicationsModule,
    AnnouncementsModule,
    MaterialsModule,
  ],
})
export class AppModule {}
