import { ConflictException, Injectable } from '@nestjs/common';
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



}