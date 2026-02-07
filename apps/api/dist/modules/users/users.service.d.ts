import { UpdateProfileDto, UpdateUserSettingsDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<any>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<any>;
    updateAvatar(userId: string, file: Express.Multer.File): Promise<any>;
    updateSettings(userId: string, updateSettingsDto: UpdateUserSettingsDto): Promise<{
        message: string;
    }>;
    getUserByUsername(username: string): Promise<any>;
    deleteAccount(userId: string): Promise<void>;
    private sanitizeUser;
}
