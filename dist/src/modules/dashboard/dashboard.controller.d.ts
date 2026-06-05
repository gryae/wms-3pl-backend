import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboard(userId: string, sellerId?: string): Promise<{
        inventory: {
            totalSkus: number;
            available: number;
            reserved: number;
            damaged: number;
        };
        pendingInbound: number;
        pendingOutbound: number;
        recentReturns: {
            id: string;
            returnNo: string;
            status: import(".prisma/client").$Enums.ReturnStatus;
            reason: string;
            date: Date;
        }[];
        topProducts: {
            sku: string;
            name: string;
            available: number;
            reserved: number;
            unit: string;
        }[];
    } | {
        todayInbound: number;
        todayOutbound: number;
        pendingPicking: number;
        pendingPacking: number;
        pendingReturns: number;
        inventory: {
            totalSkus: number;
            available: number;
            reserved: number;
            damaged: number;
            reject: number;
        };
        stockAlerts: {
            sku: string;
            name: string;
            seller: string;
            available: number;
        }[];
        topSellers: any[];
    }>;
}
