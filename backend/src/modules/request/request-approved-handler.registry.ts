import { Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import type { Request } from './entities/request.entity';

export interface RequestApprovedHandler {
  handle(request: Request, manager: EntityManager): Promise<void>;
}

@Injectable()
export class RequestApprovedHandlerRegistry {
  private readonly handlers = new Map<string, RequestApprovedHandler>();

  register(handlerKey: string, handler: RequestApprovedHandler): void {
    if (this.handlers.has(handlerKey)) {
      throw new Error(`Request approved handler ${handlerKey} da ton tai`);
    }

    this.handlers.set(handlerKey, handler);
  }

  async handle(request: Request, manager: EntityManager): Promise<void> {
    const handlerKey =
      request.requestType.handlerKey ?? request.requestType.code;
    const handler = this.handlers.get(handlerKey);

    if (!handler) {
      return;
    }

    await handler.handle(request, manager);
  }
}
