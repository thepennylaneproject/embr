"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./modules/prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const content_module_1 = require("./modules/content/content.module");
const media_module_1 = require("./modules/media/media.module");
const monetization_module_1 = require("./modules/monetization/monetization.module");
const gigs_module_1 = require("./modules/gigs/gigs.module");
const social_graph_module_1 = require("./modules/social-graph/social-graph.module");
const messaging_module_1 = require("./modules/messaging/messaging.module");
const safety_module_1 = require("./modules/safety/safety.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            content_module_1.ContentModule,
            media_module_1.MediaModule,
            monetization_module_1.MonetizationModule,
            gigs_module_1.GigsModule,
            social_graph_module_1.SocialGraphModule,
            messaging_module_1.MessagingModule,
            safety_module_1.SafetyModule,
            notifications_module_1.NotificationsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map