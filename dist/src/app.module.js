"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const sellers_module_1 = require("./modules/sellers/sellers.module");
const products_module_1 = require("./modules/products/products.module");
const couriers_module_1 = require("./modules/couriers/couriers.module");
const inventory_module_1 = require("./modules/inventory/inventory.module");
const inbound_module_1 = require("./modules/inbound/inbound.module");
const outbound_module_1 = require("./modules/outbound/outbound.module");
const picking_module_1 = require("./modules/picking/picking.module");
const packing_module_1 = require("./modules/packing/packing.module");
const returns_module_1 = require("./modules/returns/returns.module");
const manifests_module_1 = require("./modules/manifests/manifests.module");
const stock_opname_module_1 = require("./modules/stock-opname/stock-opname.module");
const reports_module_1 = require("./modules/reports/reports.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const search_module_1 = require("./modules/search/search.module");
const help_center_module_1 = require("./modules/help-center/help-center.module");
const audit_logs_module_1 = require("./modules/audit-logs/audit-logs.module");
const files_module_1 = require("./modules/files/files.module");
const settings_module_1 = require("./modules/settings/settings.module");
const shipping_label_module_1 = require("./modules/shipping-label/shipping-label.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            sellers_module_1.SellersModule,
            products_module_1.ProductsModule,
            couriers_module_1.CouriersModule,
            inventory_module_1.InventoryModule,
            inbound_module_1.InboundModule,
            outbound_module_1.OutboundModule,
            picking_module_1.PickingModule,
            packing_module_1.PackingModule,
            returns_module_1.ReturnsModule,
            manifests_module_1.ManifestsModule,
            stock_opname_module_1.StockOpnameModule,
            reports_module_1.ReportsModule,
            dashboard_module_1.DashboardModule,
            notifications_module_1.NotificationsModule,
            search_module_1.SearchModule,
            help_center_module_1.HelpCenterModule,
            audit_logs_module_1.AuditLogsModule,
            files_module_1.FilesModule,
            settings_module_1.SettingsModule,
            shipping_label_module_1.ShippingLabelModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map