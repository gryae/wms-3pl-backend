"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../common/services/audit-log.service");
const client_1 = require("@prisma/client");
let SettingsService = class SettingsService {
    constructor(prisma, auditLogService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
    }
    async findAll() {
        return this.prisma.warehouseConfig.findMany({
            orderBy: { key: 'asc' },
        });
    }
    async findByKey(key) {
        const config = await this.prisma.warehouseConfig.findUnique({
            where: { key },
        });
        if (!config) {
            throw new common_1.NotFoundException(`Config key ${key} not found`);
        }
        return config;
    }
    async updateMany(dto, currentUserId) {
        const before = await this.findAll();
        const updated = await this.prisma.$transaction(async (tx) => {
            const results = [];
            for (const item of dto.settings) {
                const check = await tx.warehouseConfig.findUnique({ where: { key: item.key } });
                if (!check) {
                    throw new common_1.NotFoundException(`Config key ${item.key} does not exist`);
                }
                const res = await tx.warehouseConfig.update({
                    where: { key: item.key },
                    data: { value: item.value },
                });
                results.push(res);
            }
            return results;
        });
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.UPDATE,
            entity: 'warehouse_configs',
            description: 'System warehouse prefix configurations modified',
            before,
            after: updated,
        });
        return updated;
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map