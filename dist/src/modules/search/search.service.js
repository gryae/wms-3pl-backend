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
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SearchService = class SearchService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async search(query, sellerId) {
        if (!query || query.trim().length < 2) {
            return [];
        }
        const term = query.trim();
        const results = [];
        const [products, inbounds, outbounds, returns, manifests, sellers] = await Promise.all([
            this.prisma.product.findMany({
                where: {
                    deletedAt: null,
                    sellerId: sellerId || undefined,
                    OR: [
                        { sku: { contains: term, mode: 'insensitive' } },
                        { barcode: { contains: term, mode: 'insensitive' } },
                        { name: { contains: term, mode: 'insensitive' } },
                    ],
                },
                include: { seller: { select: { name: true } } },
                take: 5,
            }),
            this.prisma.inbound.findMany({
                where: {
                    deletedAt: null,
                    sellerId: sellerId || undefined,
                    OR: [
                        { inboundNo: { contains: term, mode: 'insensitive' } },
                        { referenceNo: { contains: term, mode: 'insensitive' } },
                    ],
                },
                include: { seller: { select: { name: true } } },
                take: 5,
            }),
            this.prisma.outbound.findMany({
                where: {
                    deletedAt: null,
                    sellerId: sellerId || undefined,
                    OR: [
                        { outboundNo: { contains: term, mode: 'insensitive' } },
                        { trackingNumber: { contains: term, mode: 'insensitive' } },
                        { recipientName: { contains: term, mode: 'insensitive' } },
                    ],
                },
                include: { seller: { select: { name: true } } },
                take: 5,
            }),
            this.prisma.return.findMany({
                where: {
                    sellerId: sellerId || undefined,
                    OR: [
                        { returnNo: { contains: term, mode: 'insensitive' } },
                        { reason: { contains: term, mode: 'insensitive' } },
                    ],
                },
                include: { seller: { select: { name: true } } },
                take: 5,
            }),
            !sellerId
                ? this.prisma.manifest.findMany({
                    where: {
                        OR: [
                            { manifestNo: { contains: term, mode: 'insensitive' } },
                            { courier: { name: { contains: term, mode: 'insensitive' } } },
                        ],
                    },
                    include: { courier: { select: { name: true } } },
                    take: 5,
                })
                : Promise.resolve([]),
            !sellerId
                ? this.prisma.seller.findMany({
                    where: {
                        deletedAt: null,
                        OR: [
                            { code: { contains: term, mode: 'insensitive' } },
                            { name: { contains: term, mode: 'insensitive' } },
                        ],
                    },
                    take: 5,
                })
                : Promise.resolve([]),
        ]);
        products.forEach((p) => {
            results.push({
                id: p.id,
                type: 'PRODUCT',
                title: p.name,
                subtitle: `SKU: ${p.sku} | Barcode: ${p.barcode || '-'} | Seller: ${p.seller.name}`,
                link: `/products?id=${p.id}`,
            });
        });
        inbounds.forEach((i) => {
            results.push({
                id: i.id,
                type: 'INBOUND',
                title: i.inboundNo,
                subtitle: `Inbound shipment (${i.status}) | Ref: ${i.referenceNo || '-'} | Seller: ${i.seller.name}`,
                link: `/inbound/${i.id}`,
            });
        });
        outbounds.forEach((o) => {
            results.push({
                id: o.id,
                type: 'OUTBOUND',
                title: o.outboundNo,
                subtitle: `Outbound order (${o.status}) | Recipient: ${o.recipientName} | Tracking: ${o.trackingNumber || '-'}`,
                link: `/outbound/${o.id}`,
            });
        });
        returns.forEach((r) => {
            results.push({
                id: r.id,
                type: 'RETURN',
                title: r.returnNo,
                subtitle: `Customer Return (${r.status}) | Reason: ${r.reason} | Seller: ${r.seller.name}`,
                link: `/returns/${r.id}`,
            });
        });
        manifests.forEach((m) => {
            results.push({
                id: m.id,
                type: 'MANIFEST',
                title: m.manifestNo,
                subtitle: `Dispatch Manifest (${m.status}) | Courier: ${m.courier.name}`,
                link: `/manifests?id=${m.id}`,
            });
        });
        sellers.forEach((s) => {
            results.push({
                id: s.id,
                type: 'SELLER',
                title: s.name,
                subtitle: `Registered Seller Partner | Code: ${s.code}`,
                link: `/sellers?id=${s.id}`,
            });
        });
        return results;
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SearchService);
//# sourceMappingURL=search.service.js.map