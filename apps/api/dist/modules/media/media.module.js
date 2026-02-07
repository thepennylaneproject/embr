"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const media_upload_controller_1 = require("./controllers/media-upload.controller");
const mux_webhook_controller_1 = require("./controllers/mux-webhook.controller");
const s3_multipart_service_1 = require("./services/s3-multipart.service");
const mux_video_service_1 = require("./services/mux-video.service");
const thumbnail_service_1 = require("./services/thumbnail.service");
const media_service_1 = require("./services/media.service");
const prisma_module_1 = require("../prisma/prisma.module");
let MediaModule = class MediaModule {
};
exports.MediaModule = MediaModule;
exports.MediaModule = MediaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            event_emitter_1.EventEmitterModule.forRoot(),
            prisma_module_1.PrismaModule,
        ],
        controllers: [
            media_upload_controller_1.MediaUploadController,
            mux_webhook_controller_1.MuxWebhookController,
        ],
        providers: [
            s3_multipart_service_1.S3MultipartService,
            mux_video_service_1.MuxVideoService,
            thumbnail_service_1.ThumbnailService,
            media_service_1.MediaService,
        ],
        exports: [
            s3_multipart_service_1.S3MultipartService,
            mux_video_service_1.MuxVideoService,
            thumbnail_service_1.ThumbnailService,
            media_service_1.MediaService,
        ],
    })
], MediaModule);
//# sourceMappingURL=media.module.js.map