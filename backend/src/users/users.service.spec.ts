jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

import { Test } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

import { UsersService } from './users.service';
import { User } from './schemas/user.schema';

describe('UsersService', () => {
  let service: UsersService;

  const findOneExec = jest.fn();
  const findOneLean = jest.fn();

  const findExec = jest.fn();
  const findSort = jest.fn();
  const findSkip = jest.fn();
  const findLimit = jest.fn();
  const findLean = jest.fn();

  const userModel: any = {
    create: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    (bcrypt.hash as jest.Mock).mockReset();

    userModel.findOne.mockReturnValue({ lean: findOneLean });
    findOneLean.mockResolvedValue(null);

    userModel.find.mockReturnValue({ sort: findSort });
    findSort.mockReturnValue({ skip: findSkip });
    findSkip.mockReturnValue({ limit: findLimit });
    findLimit.mockReturnValue({ lean: findLean });
    findLean.mockResolvedValue([]);

    userModel.countDocuments.mockResolvedValue(0);

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

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
  });

  it('findOne should return mapped user without passwordHash', async () => {
    findOneLean.mockResolvedValueOnce({
      _id: { toString: () => 'abc123' },
      email: 'ana@mail.com',
      role: 'USER',
      passwordHash: 'SECRET',
      profile: {
        firstName: 'Ana',
        lastName: 'Perez',
        birthDate: new Date('2000-01-01'),
        phone: null,
      },
      deletedAt: null,
    });

    const res = await service.findOne('abc123');

    expect(userModel.findOne).toHaveBeenCalledWith({
      _id: 'abc123',
      deletedAt: null,
    });

    expect(res).toEqual({
      id: 'abc123',
      email: 'ana@mail.com',
      role: 'USER',
      profile: {
        firstName: 'Ana',
        lastName: 'Perez',
        birthDate: expect.any(Date),
        phone: null,
      },
    });

    expect((res as any).passwordHash).toBeUndefined();
  });

  it('findOne should throw NotFoundException when user does not exist', async () => {
    findOneLean.mockResolvedValueOnce(null);

    await expect(service.findOne('nope')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('findAll should default page/limit and return paginated result', async () => {
    findLean.mockResolvedValueOnce([
      {
        _id: { toString: () => 'u1' },
        email: 'u1@mail.com',
        role: 'USER',
        profile: { firstName: 'U1', lastName: 'Test' },
      },
    ]);
    userModel.countDocuments.mockResolvedValueOnce(1);

    const res = await service.findAll(undefined as any, undefined as any);

    expect(userModel.find).toHaveBeenCalledWith({ deletedAt: null });
    expect(findSort).toHaveBeenCalledWith({ createdAt: -1, _id: -1 });
    expect(findSkip).toHaveBeenCalledWith(0);
    expect(findLimit).toHaveBeenCalledWith(10);
    expect(userModel.countDocuments).toHaveBeenCalledWith({ deletedAt: null });

    expect(res).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      items: [
        {
          id: 'u1',
          email: 'u1@mail.com',
          role: 'USER',
          profile: { firstName: 'U1', lastName: 'Test' },
        },
      ],
    });
  });

  it('findAll should apply page/limit and cap limit to 100', async () => {
    userModel.countDocuments.mockResolvedValueOnce(0);

    await service.findAll(3, 500);

    expect(findSkip).toHaveBeenCalledWith((3 - 1) * 100);
    expect(findLimit).toHaveBeenCalledWith(100);
  });
});