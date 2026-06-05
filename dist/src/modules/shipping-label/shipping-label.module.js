"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingLabelModule = void 0;
const common_1 = require("@nestjs/common");
const shipping_label_service_1 = require("./shipping-label.service");
const shipping_label_controller_1 = require("./shipping-label.controller");
let ShippingLabelModule = class ShippingLabelModule {
};
exports.ShippingLabelModule = ShippingLabelModule;
exports.ShippingLabelModule = ShippingLabelModule = __decorate([
    (0, common_1.Module)({
        controllers: [shipping_label_controller_1.ShippingLabelController],
        providers: [shipping_label_service_1.ShippingLabelService],
        exports: [shipping_label_service_1.ShippingLabelService],
    })
], ShippingLabelModule);
//# sourceMappingURL=shipping-label.module.js.map