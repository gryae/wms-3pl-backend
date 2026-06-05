import { Module } from '@nestjs/common';
import { ShippingLabelService } from './shipping-label.service';
import { ShippingLabelController } from './shipping-label.controller';

@Module({
  controllers: [ShippingLabelController],
  providers: [ShippingLabelService],
  exports: [ShippingLabelService],
})
export class ShippingLabelModule {}
