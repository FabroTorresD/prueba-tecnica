jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

import { Test } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

import { UsersService } from './users.service';
import { User } from './schemas/user.schema';

describe('UsersService', () => {
  let service: UsersService;

  const userModel = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    userModel.create.mockReset();
    (bcrypt.hash as jest.Mock).mockReset();

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  it('should create user and return only id', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('HASHED');

    userModel.create.mockResolvedValue({
      _id: { toString: () => 'abc123' },
    });

    const dto: any = {
      email: 'ana@mail.com',
      password: '123456',
      profile: { firstName: 'Ana', lastName: 'Perez' },
    };

    const res = await service.create(dto);

    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
    expect(userModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'ana@mail.com',
        passwordHash: 'HASHED',
        role: 'USER',
        deletedAt: null,
      }),
    );

    expect(res).toEqual({ id: 'abc123' });
  });

  it('should throw ConflictException (409) on duplicate email', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('HASHED');
    userModel.create.mockRejectedValue({ code: 11000 });

    const dto: any = {
      email: 'ana@mail.com',
      password: '123456',
      profile: { firstName: 'Ana', lastName: 'Perez' },
    };

    await expect(service.create(dto)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});