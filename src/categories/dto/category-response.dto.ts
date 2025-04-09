import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  parentId?: string;

  @ApiProperty({ type: [Object], required: false })
  ancestors?: any[];

  @ApiProperty()
  level: number;

  @ApiProperty({ required: false })
  imageUrl?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  displayOrder: number;

  @ApiProperty({ required: false })
  metaTitle?: string;

  @ApiProperty({ required: false })
  metaDescription?: string;

  @ApiProperty({ type: [String], required: false })
  attributes?: string[];

  @ApiProperty({ type: [String], required: false })
  seoKeywords?: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
