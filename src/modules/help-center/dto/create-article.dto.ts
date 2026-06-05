import { IsNotEmpty, IsString, IsOptional, IsArray, IsBoolean, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({ example: 'clh8123abc456def789', description: 'Category ID' })
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @ApiProperty({ example: 'inbound-workflow' })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiProperty({ example: 'How to receive inbound shipments' })
  @IsNotEmpty()
  @IsString()
  titleEn: string;

  @ApiProperty({ example: 'Cara melakukan penerimaan barang' })
  @IsNotEmpty()
  @IsString()
  titleId: string;

  @ApiProperty({ example: 'Step by step guide to receiving shipments...' })
  @IsNotEmpty()
  @IsString()
  contentEn: string;

  @ApiProperty({ example: 'Panduan langkah demi langkah menerima kiriman barang...' })
  @IsNotEmpty()
  @IsString()
  contentId: string;

  @ApiPropertyOptional({ example: '/inbound', description: 'Contextual page router association if any' })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ type: [String], example: ['inbound', 'receiving'] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean = true;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number = 0;
}
