import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        userId: string;
        type: string;
        title?: string;
        message?: string;
        body?: string;
        metadata?: Record<string, any>;
        actorId?: string;
        referenceId?: string;
        referenceType?: string;
    }): Promise<{
        message: string | null;
        id: string;
        createdAt: Date;
        userId: string;
        type: string;
        title: string | null;
        referenceId: string | null;
        referenceType: string | null;
        actorId: string | null;
        isRead: boolean;
    }>;
}
