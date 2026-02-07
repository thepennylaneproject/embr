// apps/api/src/modules/users/users.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { UpdateProfileDto, UpdateUserSettingsDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile', 'wallet'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update profile fields
    Object.assign(user.profile, updateProfileDto);
    await this.profileRepository.save(user.profile);

    return this.sanitizeUser(user);
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // TODO: Upload to S3 and get URL
    const avatarUrl = `https://example.com/avatars/${userId}/${file.filename}`;

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.profile.profilePicture = avatarUrl;
    await this.profileRepository.save(user.profile);

    return { profilePicture: avatarUrl };
  }

  async updateSettings(userId: string, updateSettingsDto: UpdateUserSettingsDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update settings
    Object.assign(user.profile, updateSettingsDto);
    await this.profileRepository.save(user.profile);

    return { message: 'Settings updated successfully' };
  }

  async getUserByUsername(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async deleteAccount(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete
    await this.userRepository.softRemove(user);
  }

  private sanitizeUser(user: User) {
    const { passwordHash, googleId, ...sanitized } = user;
    return sanitized;
  }
}
