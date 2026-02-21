import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

function isDuplicateKey(err: any) {
  return err?.code === 11000;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) { }

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
      createdAt: user.createdAt,
      profile: {
        firstName: user.profile?.firstName ?? null,
        lastName: user.profile?.lastName ?? null,
        birthDate: user.profile?.birthDate ?? null,
        phone: user.profile?.phone ?? null,
      },
    };
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    sort?: string,
    order: 'asc' | 'desc' = 'desc',
  ) {
    const safePage = Number.isFinite(page) ? Math.max(1, Math.trunc(page)) : 1;
    const safeLimit = Number.isFinite(limit)
      ? Math.min(100, Math.max(1, Math.trunc(limit)))
      : 10;

    const filter: any = { deletedAt: null };

    if (search) {
      filter.$or = [
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } },
      ];
    }

    const allowedSortFields = [
      'email',
      'role',
      'createdAt',
      'profile.firstName',
      'profile.lastName',
    ];

    const sortField = allowedSortFields.includes(sort ?? '')
      ? sort
      : 'createdAt';

    const sortOrder = order === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ [sortField!]: sortOrder })
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

  async findByEmail(email: string) {
    const normalized = email.toLowerCase().trim();

    const user = await this.userModel
      .findOne({ email: normalized, deletedAt: null })
      .lean();

    if (!user) return null;

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const set: any = {};

    if (dto.email !== undefined) set.email = dto.email;
    if (dto.role !== undefined) set.role = dto.role;

    if (dto.profile !== undefined) {
      if (dto.profile.firstName !== undefined)
        set['profile.firstName'] = dto.profile.firstName;
      if (dto.profile.lastName !== undefined)
        set['profile.lastName'] = dto.profile.lastName;
      if (dto.profile.phone !== undefined)
        set['profile.phone'] = dto.profile.phone;

      if (dto.profile.birthDate !== undefined) {
        set['profile.birthDate'] =
          dto.profile.birthDate === null
            ? null
            : new Date(dto.profile.birthDate);
      }
    }

    if (Object.keys(set).length === 0) {
      throw new BadRequestException({ message: 'No fields to update' });
    }

    try {
      const updated = await this.userModel
        .findOneAndUpdate(
          { _id: id, deletedAt: null },
          { $set: set },
          { new: true },
        )
        .lean();

      if (!updated) {
        throw new NotFoundException({ message: 'User not found' });
      }

      return {
        id: updated._id.toString(),
        email: updated.email,
        role: updated.role,
        createdAt: updated.createdAt,
        profile: {
          firstName: updated.profile?.firstName ?? null,
          lastName: updated.profile?.lastName ?? null,
          birthDate: updated.profile?.birthDate ?? null,
          phone: updated.profile?.phone ?? null,
        },
      };
    } catch (err: any) {
      if (isDuplicateKey(err)) {
        throw new ConflictException({ message: 'Email already exists' });
      }
      throw err;
    }
  }

  async remove(id: string) {
    const now = new Date();

    const updated = await this.userModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        { $set: { deletedAt: now, updatedAt: now } },
        { new: false },
      )
      .lean();

    if (!updated) {
      throw new NotFoundException({ message: 'User not found' });
    }
  }
}