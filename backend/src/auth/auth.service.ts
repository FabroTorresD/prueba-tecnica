import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { UsersService } from '../users/users.service';
import { UpdateMeDto } from './dto/update-me.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const createDto: any = {
      email: dto.email,
      password: dto.password,
      role: 'USER',
      profile: {
        firstName: dto.profile.firstName,
        lastName: dto.profile.lastName,
        birthDate: dto.profile.birthDate,
        phone: dto.profile.phone ?? null,
      },
    };

    try {
      return await this.usersService.create(createDto);
    } catch (err: any) {
      if (err instanceof ConflictException) throw err;
      throw err;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException({ message: 'Invalid credentials' });
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user._id.toString(),
      role: user.role,
    });

    return { accessToken };
  }

  async me(userId: string) {
    return this.usersService.findOne(userId);
  }
  
  async onModuleInit() {
  const existingAdmin = await this.usersService.findByEmail('admin@admin.com');

  if (!existingAdmin) {
    await this.usersService.create({
      email: 'admin@admin.com',
      password: 'admin',
      role: 'ADMIN',
      profile: {
        firstName: 'System',
        lastName: 'Admin',
      },
    });
  }
}

  async updateMe(userId: string, dto: UpdateMeDto) {
    const safeDto: UpdateMeDto = {
      email: dto.email,
      profile: dto.profile,
    };

    return this.usersService.update(userId, safeDto);
  }

  async logout() {
    return;
  }
}