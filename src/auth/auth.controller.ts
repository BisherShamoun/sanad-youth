import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register') register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
  @Post('login') login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
  @UseGuards(JwtAuthGuard) @Get('profile') profile(@CurrentUser() user: any) {
    return user;
  }
  @UseGuards(JwtAuthGuard) @Post('logout') logout(
    @CurrentUser('id') userId: number,
    @CurrentUser() user: any,
  ) {
    return this.authService.logout(userId, user.sessionId);
  }
}
