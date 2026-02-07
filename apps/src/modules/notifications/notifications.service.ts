import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    userId: string;
    type: string;
    title?: string;
    message?: string;
    body?: string;
    metadata?: Record<string, any>;
    actorId?: string;
    referenceId?: string;
    referenceType?: string;
  }) {
    const { body, message, metadata, ...rest } = data;
    return this.prisma.notification.create({
      data: {
        ...rest,
        message: message ?? body,
      },
    });
  }
}
