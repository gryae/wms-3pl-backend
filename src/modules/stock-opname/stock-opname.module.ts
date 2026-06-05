import { Module } from '@nestjs/common';
import { StockOpnameService } from './stock-opname.service';
import { StockOpnameController } from './stock-opname.controller';
import { AuditLogService } from '../../common/services/audit-log.service';
import { NotificationHelperService } from '../../common/services/notification-helper.service';

@Module({
  controllers: [StockOpnameController],
  providers: [StockOpnameService, AuditLogService, NotificationHelperService],
  exports: [StockOpnameService],
})
export class StockOpnameModule {}
