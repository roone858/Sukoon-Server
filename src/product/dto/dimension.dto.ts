import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsPositive,
} from 'class-validator';

export class SizeDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  width: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  height: number;

  @IsNotEmpty()
  @IsString()
  label: string;
}

export class DimensionDto {
  @IsNotEmpty()
  @Type(() => SizeDto)
  size: SizeDto;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  stock?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
