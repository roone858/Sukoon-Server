import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsOptional()
  attributes?: string[];

  @IsArray()
  @IsOptional()
  seoKeywords?: string[];

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  displayOrder?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;
}
