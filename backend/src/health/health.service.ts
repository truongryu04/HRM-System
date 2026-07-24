import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface HealthResponse {
  status: 'ok';
  service: 'api';
  database: 'up';
  timestamp: string;
}

@Injectable()
export class HealthService {
  constructor(private readonly dataSource: DataSource) {}

  async check(): Promise<HealthResponse> {
    const timestamp = new Date().toISOString();

    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        service: 'api',
        database: 'down',
        timestamp,
      });
    }

    return {
      status: 'ok',
      service: 'api',
      database: 'up',
      timestamp,
    };
  }
}
