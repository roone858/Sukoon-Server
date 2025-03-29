import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { DimensionDto } from './dimension.dto';

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

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  stock: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(20, { each: true })
  tags?: string[];

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  categories: string[];

  @IsArray()
  @Type(() => DimensionDto)
  dimensions: DimensionDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Transform(({ value }) => parseFloat(value))
  discount?: number;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  discountEndDate?: Date;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  images?: ImageDto[];
}
