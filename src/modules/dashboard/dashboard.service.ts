import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InboundStatus, OutboundStatus, PickTaskStatus, PackTaskStatus, ReturnStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getWarehouseDashboard() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      todayInbound,
      todayOutbound,
      pendingPicking,
      pendingPacking,
      pendingReturns,
      stockSummary,
      stockAlerts,
      topSellersRaw,
    ] = await Promise.all([
      // Today's Inbound count
      this.prisma.inbound.count({
        where: {
          createdAt: { gte: todayStart, lte: todayEnd },
          deletedAt: null,
        },
      }),
      // Today's Outbound count
      this.prisma.outbound.count({
        where: {
          createdAt: { gte: todayStart, lte: todayEnd },
          deletedAt: null,
        },
      }),
      // Pending Picking tasks count
      this.prisma.pickTask.count({
        where: { status: PickTaskStatus.PENDING },
      }),
      // Pending Packing tasks count
      this.prisma.packTask.count({
        where: { status: PackTaskStatus.PENDING },
      }),
      // Pending Returns count
      this.prisma.return.count({
        where: { status: ReturnStatus.SUBMITTED },
      }),
      // Inventory Summary totals
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
      // Stock alerts (Available stock < 10)
      this.prisma.inventoryBalance.findMany({
        where: { available: { lt: 10 } },
        include: {
          product: { select: { sku: true, name: true } },
          seller: { select: { name: true } },
        },
        take: 5,
        orderBy: { available: 'asc' },
      }),
      // Top Sellers (aggregate outbounds by seller)
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

    // Format top sellers names
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

  async getSellerDashboard(sellerId: string) {
    const [
      stockSummary,
      pendingInbound,
      pendingOutbound,
      recentReturns,
      inventoryBalances,
    ] = await Promise.all([
      // Inventory balance aggregates for the seller
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
      // Pending/Submitted Inbound count
      this.prisma.inbound.count({
        where: {
          sellerId,
          status: { in: [InboundStatus.SUBMITTED, InboundStatus.RECEIVING] },
          deletedAt: null,
        },
      }),
      // Pending Outbound count (DRAFT / SUBMITTED / ALLOCATED / PICKING / PACKING / READY_TO_SHIP)
      this.prisma.outbound.count({
        where: {
          sellerId,
          status: {
            in: [
              OutboundStatus.DRAFT,
              OutboundStatus.SUBMITTED,
              OutboundStatus.ALLOCATED,
              OutboundStatus.PICKING,
              OutboundStatus.PACKING,
              OutboundStatus.READY_TO_SHIP,
            ],
          },
          deletedAt: null,
        },
      }),
      // Recent returns (inspecting / submitted)
      this.prisma.return.findMany({
        where: { sellerId },
        include: {
          createdBy: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      // Top inventory list
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
}
