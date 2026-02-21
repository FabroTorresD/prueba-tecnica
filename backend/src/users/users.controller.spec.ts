import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const usersServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
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

  it('findAll should default to page=1 and limit=10 when no query params', async () => {
    usersServiceMock.findAll.mockResolvedValueOnce({
      page: 1,
      limit: 10,
      total: 0,
      items: [],
    });

    const res = await controller.findAll(undefined, undefined);

    expect(usersServiceMock.findAll).toHaveBeenCalledWith(1, 10);
    expect(res).toEqual({ page: 1, limit: 10, total: 0, items: [] });
  });

  it('findAll should parse page and limit and call service.findAll', async () => {
    usersServiceMock.findAll.mockResolvedValueOnce({
      page: 2,
      limit: 5,
      total: 12,
      items: [],
    });

    const res = await controller.findAll('2', '5');

    expect(usersServiceMock.findAll).toHaveBeenCalledWith(2, 5);
    expect(res).toEqual({ page: 2, limit: 5, total: 12, items: [] });
  });
});