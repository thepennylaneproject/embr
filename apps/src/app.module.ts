import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ContentModule } from './modules/content/content.module';
import { MediaModule } from './modules/media/media.module';
import { MonetizationModule } from './modules/monetization/monetization.module';
import { GigsModule } from './modules/gigs/gigs.module';
import { SocialGraphModule } from './modules/social-graph/social-graph.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { SafetyModule } from './modules/safety/safety.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ContentModule,
    MediaModule,
    MonetizationModule,
    GigsModule,
    SocialGraphModule,
    MessagingModule,
    SafetyModule,
    NotificationsModule,
  ],
})
export class AppModule {}
