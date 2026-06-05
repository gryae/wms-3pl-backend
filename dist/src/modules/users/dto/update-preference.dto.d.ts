import { Language } from '@prisma/client';
export declare class UpdatePreferenceDto {
    language?: Language;
    theme?: string;
    timezone?: string;
}
