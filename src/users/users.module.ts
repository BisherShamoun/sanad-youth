import { Module } from '@nestjs/common';
import { UsersController } from '../module/users/users.controller.js';
import { UsersService } from '../module/users/users.service.js';
@Module({ controllers: [UsersController], providers: [UsersService] })
export class UsersModule {}
