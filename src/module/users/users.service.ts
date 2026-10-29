import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSupervisorDto } from './dto/create-supervisor.dto.js';
import { ListUsersDto } from './dto/list-users.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async me(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async createSupervisor(dto: CreateSupervisorDto) {
    try {
      return await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: await bcrypt.hash(dto.password, 10),
          role: Role.SUPERVISOR,
        },
        select: userPublicSelect,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('Email is already registered');
      }
      throw e;
    }
  }

  async findAll(q: ListUsersDto) {
    const where: Prisma.UserWhereInput = {
      ...(q.role && { role: q.role }),
      ...(q.search && {
        OR: [
          { name: { contains: q.search, mode: 'insensitive' } },
          { email: { contains: q.search, mode: 'insensitive' } },
        ],
      }),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: userPublicSelect,
        orderBy: { id: 'desc' },
        ...skipTake(q.page, q.limit),
      }),
    ]);
    return paginated(data, total, q.page, q.limit);
  }
}
