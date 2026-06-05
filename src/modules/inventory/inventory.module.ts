import { Module, Global } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { AuditLogService } from '../../common/services/audit-log.service';

@Global()
@Module({
  controllers: [InventoryController],
  providers: [InventoryService, AuditLogService],
  exports: [InventoryService],
})
export class InventoryModule {}
