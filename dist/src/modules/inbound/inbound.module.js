"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InboundModule = void 0;
const common_1 = require("@nestjs/common");
const inbound_service_1 = require("./inbound.service");
const inbound_controller_1 = require("./inbound.controller");
const audit_log_service_1 = require("../../common/services/audit-log.service");
const notification_helper_service_1 = require("../../common/services/notification-helper.service");
let InboundModule = class InboundModule {
};
exports.InboundModule = InboundModule;
exports.InboundModule = InboundModule = __decorate([
    (0, common_1.Module)({
        controllers: [inbound_controller_1.InboundController],
        providers: [inbound_service_1.InboundService, audit_log_service_1.AuditLogService, notification_helper_service_1.NotificationHelperService],
        exports: [inbound_service_1.InboundService],
    })
], InboundModule);
//# sourceMappingURL=inbound.module.js.map