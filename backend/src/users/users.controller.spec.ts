import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const usersServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should call service.create and return id', async () => {
    usersServiceMock.create.mockResolvedValueOnce({ id: 'abc123' });

    const dto: any = {
      email: 'ana@mail.com',
      password: '123456',
      profile: { firstName: 'Ana', lastName: 'Perez' },
    };

    const res = await controller.create(dto);

    expect(usersServiceMock.create).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ id: 'abc123' });
  });

  it('findOne should call service.findOne with id', async () => {
    usersServiceMock.findOne.mockResolvedValueOnce({
      id: 'abc123',
      email: 'ana@mail.com',
      role: 'USER',
      createdAt: new Date(),
      profile: {
        firstName: 'Ana',
        lastName: 'Perez',
        birthDate: null,
        phone: null,
      },
    });

    const res = await controller.findOne('abc123');

    expect(usersServiceMock.findOne).toHaveBeenCalledWith('abc123');
    expect(res).toEqual(
      expect.objectContaining({
        id: 'abc123',
        email: 'ana@mail.com',
        role: 'USER',
      }),
    );
  });

  it('findAll should default to page=1, limit=10, order=desc when no params', async () => {
    usersServiceMock.findAll.mockResolvedValueOnce({
      page: 1,
      limit: 10,
      total: 0,
      items: [],
    });

    const res = await controller.findAll(undefined, undefined, undefined, undefined, undefined);

    expect(usersServiceMock.findAll).toHaveBeenCalledWith(1, 10, undefined, undefined, 'desc');
    expect(res).toEqual({ page: 1, limit: 10, total: 0, items: [] });
  });

  it('findAll should parse page/limit and forward search', async () => {
    usersServiceMock.findAll.mockResolvedValueOnce({
      page: 2,
      limit: 5,
      total: 12,
      items: [],
    });

    const res = await controller.findAll('2', '5', 'ana', undefined, undefined);

    expect(usersServiceMock.findAll).toHaveBeenCalledWith(2, 5, 'ana', undefined, 'desc');
    expect(res).toEqual({ page: 2, limit: 5, total: 12, items: [] });
  });

  it('findAll should forward sort and order', async () => {
    usersServiceMock.findAll.mockResolvedValueOnce({
      page: 1,
      limit: 10,
      total: 0,
      items: [],
    });

    await controller.findAll('1', '10', 'ana', 'email', 'asc');

    expect(usersServiceMock.findAll).toHaveBeenCalledWith(1, 10, 'ana', 'email', 'asc');
  });

  it('remove should call service.remove and return void', async () => {
    usersServiceMock.remove.mockResolvedValueOnce(undefined);

    const res = await controller.remove('abc123');

    expect(usersServiceMock.remove).toHaveBeenCalledWith('abc123');
    expect(res).toBeUndefined();
  });
});