"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const messaging_controller_1 = require("./controllers/messaging.controller");
const messaging_service_1 = require("./services/messaging.service");
const messaging_gateway_1 = require("./gateways/messaging.gateway");
const upload_module_1 = require("../upload/upload.module");
let MessagingModule = class MessagingModule {
};
exports.MessagingModule = MessagingModule;
exports.MessagingModule = MessagingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            upload_module_1.UploadModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: '7d' },
            }),
        ],
        controllers: [messaging_controller_1.MessagingController],
        providers: [messaging_service_1.MessagingService, messaging_gateway_1.MessagingGateway],
        exports: [messaging_service_1.MessagingService, messaging_gateway_1.MessagingGateway],
    })
], MessagingModule);
//# sourceMappingURL=messaging.module.js.map