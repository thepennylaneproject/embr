"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafetyModule = void 0;
const common_1 = require("@nestjs/common");
const safety_controller_1 = require("./controllers/safety.controller");
const moderation_actions_service_1 = require("./services/moderation-actions.service");
const blocking_service_1 = require("./services/blocking.service");
const reports_service_1 = require("./services/reports.service");
const appeals_service_1 = require("./services/appeals.service");
const content_filter_service_1 = require("./services/content-filter.service");
const roles_guard_1 = require("./guards/roles.guard");
const notifications_module_1 = require("../notifications/notifications.module");
let SafetyModule = class SafetyModule {
};
exports.SafetyModule = SafetyModule;
exports.SafetyModule = SafetyModule = __decorate([
    (0, common_1.Module)({
        imports: [notifications_module_1.NotificationsModule],
        controllers: [safety_controller_1.SafetyController],
        providers: [
            moderation_actions_service_1.ModerationActionsService,
            blocking_service_1.BlockingService,
            reports_service_1.ReportsService,
            appeals_service_1.AppealsService,
            content_filter_service_1.ContentFilterService,
            roles_guard_1.RolesGuard,
        ],
        exports: [
            moderation_actions_service_1.ModerationActionsService,
            blocking_service_1.BlockingService,
            reports_service_1.ReportsService,
            appeals_service_1.AppealsService,
            content_filter_service_1.ContentFilterService,
        ],
    })
], SafetyModule);
//# sourceMappingURL=safety.module.js.map