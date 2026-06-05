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
exports.NotificationHelperService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let NotificationHelperService = class NotificationHelperService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async notify(dto) {
        await this.prisma.notification.create({ data: dto });
    }
    async notifyWarehouseStaff(dto) {
        const warehouseUsers = await this.prisma.user.findMany({
            where: {
                role: 'WAREHOUSE_ADMIN',
                status: 'ACTIVE',
                deletedAt: null,
            },
            select: { id: true },
        });
        for (const u of warehouseUsers) {
            await this.notify({ ...dto, userId: u.id });
        }
    }
    async notifySellerUsers(sellerId, dto) {
        const sellerUsers = await this.prisma.user.findMany({
            where: { sellerId, status: 'ACTIVE', deletedAt: null },
            select: { id: true },
        });
        for (const u of sellerUsers) {
            await this.notify({ ...dto, userId: u.id, sellerId });
        }
    }
};
exports.NotificationHelperService = NotificationHelperService;
exports.NotificationHelperService = NotificationHelperService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationHelperService);
//# sourceMappingURL=notification-helper.service.js.map