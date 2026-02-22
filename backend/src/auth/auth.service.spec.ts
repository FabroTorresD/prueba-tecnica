jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

import { Test } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;

  const usersServiceMock = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const jwtServiceMock = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    (bcrypt.compare as jest.Mock).mockReset();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  it('register should force role USER and call usersService.create', async () => {
    usersServiceMock.create.mockResolvedValueOnce({ id: 'u1' });

    const dto: any = {
      email: 'user@mail.com',
      password: '123456',
      profile: {
        firstName: 'Ana',
        lastName: 'Perez',
        birthDate: '2000-01-01',
        phone: null,
      },
    };

    const res = await service.register(dto);

    expect(usersServiceMock.create).toHaveBeenCalledWith({
      email: 'user@mail.com',
      password: '123456',
      role: 'USER',
      profile: {
        firstName: 'Ana',
        lastName: 'Perez',
        birthDate: '2000-01-01',
        phone: null,
      },
    });

    expect(res).toEqual({ id: 'u1' });
  });

  it('register should rethrow ConflictException if email already exists', async () => {
    usersServiceMock.create.mockRejectedValueOnce(
      new ConflictException({ message: 'Email already exists' }),
    );

    const dto: any = {
      email: 'user@mail.com',
      password: '123456',
      profile: { firstName: 'Ana', lastName: 'Perez' },
    };

    await expect(service.register(dto)).rejects.toBeInstanceOf(ConflictException);
  });

  it('login should throw UnauthorizedException when user not found', async () => {
    usersServiceMock.findByEmail.mockResolvedValueOnce(null);

    await expect(
      service.login({ email: 'user@mail.com', password: '123456' } as any),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(usersServiceMock.findByEmail).toHaveBeenCalledWith('user@mail.com');
  });

  it('login should throw UnauthorizedException when password is invalid', async () => {
    usersServiceMock.findByEmail.mockResolvedValueOnce({
      _id: { toString: () => 'u1' },
      role: 'USER',
      passwordHash: 'HASH',
    });

    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

    await expect(
      service.login({ email: 'user@mail.com', password: 'bad' } as any),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(bcrypt.compare).toHaveBeenCalledWith('bad', 'HASH');
  });

  it('login should return accessToken when credentials are valid', async () => {
    usersServiceMock.findByEmail.mockResolvedValueOnce({
      _id: { toString: () => 'u1' },
      role: 'USER',
      passwordHash: 'HASH',
    });

    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
    jwtServiceMock.signAsync.mockResolvedValueOnce('JWT_TOKEN');

    const res = await service.login({
      email: 'user@mail.com',
      password: '123456',
    } as any);

    expect(usersServiceMock.findByEmail).toHaveBeenCalledWith('user@mail.com');
    expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'HASH');
    expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
      sub: 'u1',
      role: 'USER',
    });

    expect(res).toEqual({ accessToken: 'JWT_TOKEN' });
  });

  it('me should call usersService.findOne', async () => {
    usersServiceMock.findOne.mockResolvedValueOnce({ id: 'u1' });

    const res = await service.me('u1');

    expect(usersServiceMock.findOne).toHaveBeenCalledWith('u1');
    expect(res).toEqual({ id: 'u1' });
  });

  it('updateMe should call usersService.update with only email/profile', async () => {
    usersServiceMock.update.mockResolvedValueOnce({ id: 'u1', email: 'new@mail.com' });

    const dto: any = {
      email: 'new@mail.com',
      profile: { phone: '3510000000' },
      role: 'ADMIN', 
    };

    const res = await service.updateMe('u1', dto);

    expect(usersServiceMock.update).toHaveBeenCalledWith('u1', {
      email: 'new@mail.com',
      profile: { phone: '3510000000' },
    });

    expect(res).toEqual({ id: 'u1', email: 'new@mail.com' });
  });

  it('logout should resolve void', async () => {
    await expect(service.logout()).resolves.toBeUndefined();
  });

  it('onModuleInit should create admin if not exists', async () => {
    usersServiceMock.findByEmail.mockResolvedValueOnce(null);
    usersServiceMock.create.mockResolvedValueOnce({ id: 'adminId' });

    await service.onModuleInit();

    expect(usersServiceMock.findByEmail).toHaveBeenCalledWith('admin@admin.com');
    expect(usersServiceMock.create).toHaveBeenCalledWith({
      email: 'admin@admin.com',
      password: 'admin',
      role: 'ADMIN',
      profile: { firstName: 'System', lastName: 'Admin' },
    });
  });

  it('onModuleInit should NOT create admin if already exists', async () => {
    usersServiceMock.findByEmail.mockResolvedValueOnce({
      _id: { toString: () => 'adminId' },
      email: 'admin@admin.com',
    });

    await service.onModuleInit();

    expect(usersServiceMock.findByEmail).toHaveBeenCalledWith('admin@admin.com');
    expect(usersServiceMock.create).not.toHaveBeenCalled();
  });
});