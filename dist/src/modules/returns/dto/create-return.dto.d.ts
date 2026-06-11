export declare class ReturnItemDto {
    productId: string;
    quantity: number;
    notes?: string;
}
export declare class CreateReturnDto {
    sellerId: string;
    outboundId?: string;
    reason?: string;
    notes?: string;
    items: ReturnItemDto[];
}
