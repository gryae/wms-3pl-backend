import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SellersModule } from './modules/sellers/sellers.module';
import { ProductsModule } from './modules/products/products.module';
import { CouriersModule } from './modules/couriers/couriers.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { InboundModule } from './modules/inbound/inbound.module';
import { OutboundModule } from './modules/outbound/outbound.module';
import { PickingModule } from './modules/picking/picking.module';
import { PackingModule } from './modules/packing/packing.module';
import { ReturnsModule } from './modules/returns/returns.module';
import { ManifestsModule } from './modules/manifests/manifests.module';
import { StockOpnameModule } from './modules/stock-opname/stock-opname.module';
import { ReportsModule } from './modules/reports/reports.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SearchModule } from './modules/search/search.module';
import { HelpCenterModule } from './modules/help-center/help-center.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { FilesModule } from './modules/files/files.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ShippingLabelModule } from './modules/shipping-label/shipping-label.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    SellersModule,
    ProductsModule,
    CouriersModule,
    InventoryModule,
    InboundModule,
    OutboundModule,
    PickingModule,
    PackingModule,
    ReturnsModule,
    ManifestsModule,
    StockOpnameModule,
    ReportsModule,
    DashboardModule,
    NotificationsModule,
    SearchModule,
    HelpCenterModule,
    AuditLogsModule,
    FilesModule,
    SettingsModule,
    ShippingLabelModule,
  ],
})
export class AppModule {}
