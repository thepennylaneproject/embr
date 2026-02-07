import { UsersService } from './users.service';
import { UpdateProfileDto, UpdateUserSettingsDto } from './dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(userId: string): Promise<any>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<any>;
    updateAvatar(userId: string, file: Express.Multer.File): Promise<any>;
    updateSettings(userId: string, updateSettingsDto: UpdateUserSettingsDto): Promise<{
        message: string;
    }>;
    getUserByUsername(username: string): Promise<any>;
    deleteAccount(userId: string): Promise<{
        message: string;
    }>;
}
