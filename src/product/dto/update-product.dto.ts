import {
  IsArray,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Transform } from 'class-transformer';

class ImageDto {
  @IsOptional()
  @IsString()
  public_id?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  altText?: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Transform(({ value }) => parseFloat(value))
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  stock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Transform(({ value }) => parseFloat(value))
  discount?: number;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  discountEndDate?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(20, { each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  categories?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  images?: ImageDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagesToDelete?: string[]; // For tracking images to remove
}
