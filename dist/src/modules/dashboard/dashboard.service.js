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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getWarehouseDashboard() {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const [todayInbound, todayOutbound, pendingPicking, pendingPacking, pendingReturns, stockSummary, stockAlerts, topSellersRaw,] = await Promise.all([
            this.prisma.inbound.count({
                where: {
                    createdAt: { gte: todayStart, lte: todayEnd },
                    deletedAt: null,
                },
            }),
            this.prisma.outbound.count({
                where: {
                    createdAt: { gte: todayStart, lte: todayEnd },
                    deletedAt: null,
                },
            }),
            this.prisma.pickTask.count({
                where: { status: client_1.PickTaskStatus.PENDING },
            }),
            this.prisma.packTask.count({
                where: { status: client_1.PackTaskStatus.PENDING },
            }),
            this.prisma.return.count({
                where: { status: client_1.ReturnStatus.SUBMITTED },
            }),
            this.prisma.inventoryBalance.aggregate({
                _sum: {
                    available: true,
                    reserved: true,
                    damaged: true,
                    reject: true,
                },
                _count: {
                    productId: true,
                },
            }),
            this.prisma.inventoryBalance.findMany({
                where: { available: { lt: 10 } },
                include: {
                    product: { select: { sku: true, name: true } },
                    seller: { select: { name: true } },
                },
                take: 5,
                orderBy: { available: 'asc' },
            }),
            this.prisma.outbound.groupBy({
                by: ['sellerId'],
                _count: {
                    id: true,
                },
                orderBy: {
                    _count: {
                        id: 'desc',
                    },
                },
                take: 5,
            }),
        ]);
        const topSellers = [];
        for (const item of topSellersRaw) {
            const seller = await this.prisma.seller.findUnique({
                where: { id: item.sellerId },
                select: { name: true, code: true },
            });
            if (seller) {
                topSellers.push({
                    sellerName: seller.name,
                    sellerCode: seller.code,
                    orderCount: item._count.id,
                });
            }
        }
        return {
            todayInbound,
            todayOutbound,
            pendingPicking,
            pendingPacking,
            pendingReturns,
            inventory: {
                totalSkus: stockSummary._count.productId || 0,
                available: stockSummary._sum.available || 0,
                reserved: stockSummary._sum.reserved || 0,
                damaged: stockSummary._sum.damaged || 0,
                reject: stockSummary._sum.reject || 0,
            },
            stockAlerts: stockAlerts.map((a) => ({
                sku: a.product.sku,
                name: a.product.name,
                seller: a.seller.name,
                available: a.available,
            })),
            topSellers,
        };
    }
    async getSellerDashboard(sellerId) {
        const [stockSummary, pendingInbound, pendingOutbound, recentReturns, inventoryBalances,] = await Promise.all([
            this.prisma.inventoryBalance.aggregate({
                where: { sellerId },
                _sum: {
                    available: true,
                    reserved: true,
                    damaged: true,
                },
                _count: {
                    productId: true,
                },
            }),
            this.prisma.inbound.count({
                where: {
                    sellerId,
                    status: { in: [client_1.InboundStatus.SUBMITTED, client_1.InboundStatus.RECEIVING] },
                    deletedAt: null,
                },
            }),
            this.prisma.outbound.count({
                where: {
                    sellerId,
                    status: {
                        in: [
                            client_1.OutboundStatus.DRAFT,
                            client_1.OutboundStatus.SUBMITTED,
                            client_1.OutboundStatus.ALLOCATED,
                            client_1.OutboundStatus.PICKING,
                            client_1.OutboundStatus.PACKING,
                            client_1.OutboundStatus.READY_TO_SHIP,
                        ],
                    },
                    deletedAt: null,
                },
            }),
            this.prisma.return.findMany({
                where: { sellerId },
                include: {
                    createdBy: { select: { name: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
            this.prisma.inventoryBalance.findMany({
                where: { sellerId },
                include: {
                    product: { select: { sku: true, name: true, unit: true } },
                },
                orderBy: { available: 'desc' },
                take: 5,
            }),
        ]);
        return {
            inventory: {
                totalSkus: stockSummary._count.productId || 0,
                available: stockSummary._sum.available || 0,
                reserved: stockSummary._sum.reserved || 0,
                damaged: stockSummary._sum.damaged || 0,
            },
            pendingInbound,
            pendingOutbound,
            recentReturns: recentReturns.map((r) => ({
                id: r.id,
                returnNo: r.returnNo,
                status: r.status,
                reason: r.reason,
                date: r.createdAt,
            })),
            topProducts: inventoryBalances.map((ib) => ({
                sku: ib.product.sku,
                name: ib.product.name,
                available: ib.available,
                reserved: ib.reserved,
                unit: ib.product.unit,
            })),
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map