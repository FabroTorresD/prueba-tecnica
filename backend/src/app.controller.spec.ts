import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { getConnectionToken } from '@nestjs/mongoose';

describe('AppController', () => {
  let controller: AppController;

  // Mock simple de la conexión de mongoose
  const connectionMock = {
    readyState: 1,
    name: 'testdb',
    host: 'localhost',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: getConnectionToken(), // <-- token que usa @InjectConnection()
          useValue: connectionMock,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  describe('GET /health', () => {
    it('should return ok + service + ts (ISO)', () => {
      const res = controller.health();

      expect(res).toEqual({
        ok: true,
        service: 'backend',
        ts: expect.any(String),
      });

      // valida que sea ISO
      expect(() => new Date(res.ts).toISOString()).not.toThrow();
    });
  });

  describe('GET /health/db', () => {
    it('should return ok=true when connected (readyState=1)', () => {
      connectionMock.readyState = 1;

      const res = controller.healthDb();

      expect(res).toEqual({
        ok: true,
        mongooseState: 'connected',
        db: 'testdb',
        host: 'localhost',
      });
    });

    it('should return ok=false and proper mongooseState when disconnected (readyState=0)', () => {
      connectionMock.readyState = 0;

      const res = controller.healthDb();

      expect(res.ok).toBe(false);
      expect(res.mongooseState).toBe('disconnected');
      expect(res.db).toBe('testdb');
      expect(res.host).toBe('localhost');
    });

    it('should return mongooseState=unknown when readyState is not mapped', () => {
      connectionMock.readyState = 99;

      const res = controller.healthDb();

      expect(res.ok).toBe(false);
      expect(res.mongooseState).toBe('unknown');
    });
  });
});