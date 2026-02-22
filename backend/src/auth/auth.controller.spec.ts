import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    register: jest.fn(),
    login: jest.fn(),
    me: jest.fn(),
    updateMe: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('register should call authService.register and return result', async () => {
    authServiceMock.register.mockResolvedValueOnce({ id: 'abc123' });

    const dto: any = {
      email: 'user@mail.com',
      password: '123456',
      profile: { firstName: 'Ana', lastName: 'Perez', phone: null },
    };

    const res = await controller.register(dto);

    expect(authServiceMock.register).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ id: 'abc123' });
  });

  it('login should call authService.login and return accessToken', async () => {
    authServiceMock.login.mockResolvedValueOnce({ accessToken: 'JWT_TOKEN' });

    const dto: any = { email: 'user@mail.com', password: '123456' };

    const res = await controller.login(dto);

    expect(authServiceMock.login).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ accessToken: 'JWT_TOKEN' });
  });

  it('me should call authService.me with req.user.sub', async () => {
    authServiceMock.me.mockResolvedValueOnce({
      id: 'u1',
      email: 'user@mail.com',
      role: 'USER',
      createdAt: new Date(),
      profile: { firstName: 'Ana', lastName: 'Perez', birthDate: null, phone: null },
    });

    const req: any = { user: { sub: 'u1' } };

    const res = await controller.me(req);

    expect(authServiceMock.me).toHaveBeenCalledWith('u1');
    expect(res).toEqual(expect.objectContaining({ id: 'u1', email: 'user@mail.com' }));
  });

  it('updateMe should call authService.updateMe with req.user.sub and dto', async () => {
    authServiceMock.updateMe.mockResolvedValueOnce({
      id: 'u1',
      email: 'new@mail.com',
      role: 'USER',
      createdAt: new Date(),
      profile: { firstName: 'Ana', lastName: 'Perez', birthDate: null, phone: '3510000000' },
    });

    const req: any = { user: { sub: 'u1' } };
    const dto: any = { email: 'new@mail.com', profile: { phone: '3510000000' } };

    const res = await controller.updateMe(req, dto);

    expect(authServiceMock.updateMe).toHaveBeenCalledWith('u1', dto);
    expect(res).toEqual(expect.objectContaining({ id: 'u1', email: 'new@mail.com' }));
  });

  it('logout should call authService.logout and return void', async () => {
    authServiceMock.logout.mockResolvedValueOnce(undefined);

    const res = await controller.logout();

    expect(authServiceMock.logout).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
  });
});