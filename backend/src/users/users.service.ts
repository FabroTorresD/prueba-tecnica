import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schemas/user.schema';

function isDuplicateKey(err: any) {
  return err?.code === 11000;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    try {
      const created = await this.userModel.create({
        email: dto.email,
        passwordHash,
        role: dto.role ?? 'USER',
        profile: {
          firstName: dto.profile.firstName,
          lastName: dto.profile.lastName,
          birthDate: dto.profile.birthDate
            ? new Date(dto.profile.birthDate)
            : undefined,
          phone: dto.profile.phone ?? null,
        },
        deletedAt: null,
      });

      return { id: created._id.toString() };
    } catch (err: any) {
      if (isDuplicateKey(err)) {
        throw new ConflictException({ message: 'Email already exists' });
      }
      throw err;
    }
  }

  async findOne(id: string) {
    const user = await this.userModel
      .findOne({ _id: id, deletedAt: null })
      .lean();

    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      profile: {
        firstName: user.profile?.firstName ?? null,
        lastName: user.profile?.lastName ?? null,
        birthDate: user.profile?.birthDate ?? null,
        phone: user.profile?.phone ?? null,
      },
    };
  }

  async findAll(page = 1, limit = 10) {
    const safePage = Number.isFinite(page) ? Math.max(1, Math.trunc(page)) : 1;
    const safeLimit = Number.isFinite(limit)
      ? Math.min(100, Math.max(1, Math.trunc(limit)))
      : 10;

    const filter = { deletedAt: null };

    const [items, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .lean(),
      this.userModel.countDocuments(filter),
    ]);

    return {
      page: safePage,
      limit: safeLimit,
      total,
      items: items.map((u: any) => ({
        id: u._id.toString(),
        email: u.email,
        role: u.role,
        profile: {
          firstName: u.profile?.firstName ?? null,
          lastName: u.profile?.lastName ?? null,
        },
      })),
    };
  }
}