export declare class ConfirmPackItemDto {
    productId: string;
    packedQty: number;
}
export declare class ConfirmPackDto {
    boxCount: number;
    weight: number;
    notes?: string;
    items: ConfirmPackItemDto[];
}
