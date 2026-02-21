import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller()
export class AppController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get('health')
  health() {
    return { ok: true, service: 'backend', ts: new Date().toISOString() };
  }

  @Get('health/db')
  healthDb() {
    const state = this.connection.readyState;
    const map: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    return {
      ok: state === 1,
      mongooseState: map[state] ?? 'unknown',
      db: this.connection.name,
      host: this.connection.host,
    };
  }
}