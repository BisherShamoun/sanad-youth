import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { Prisma } from '../generated/prisma/client.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email.toLowerCase() }, { username: dto.username }],
      },
    });
    if (existing)
      throw new ConflictException('Email or username is already in use');
    const user = await this.prisma.user.create({
      data: {
        ...dto,
        email: dto.email.toLowerCase(),
        password: await bcrypt.hash(dto.password, 12),
      },
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
    return user;
  }
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.identifier.toLowerCase() },
          { username: dto.identifier },
        ],
      },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.password)))
      throw new UnauthorizedException(
        'Username/email or password is incorrect',
      );
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: '',
        expiresAt: new Date(Date.now() + 7 * 86400000),
      },
    });
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      sid: session.id,
      role: user.role,
    });
    const refreshToken = randomBytes(48).toString('hex');
    await this.prisma.session.update({
      where: { id: session.id },
      data: { refreshTokenHash: this.hash(refreshToken) },
    });
    const { password, ...safeUser } = user;
    return { accessToken, refreshToken, user: safeUser };
  }
  async logout(userId: number, sessionId: number) {
    await this.prisma.session.updateMany({
      where: { id: sessionId, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { message: 'Logged out successfully' };
  }
  private hash(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }
}
