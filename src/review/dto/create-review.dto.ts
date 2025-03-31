import {
  IsNumber,
  IsString,
  Min,
  Max,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @IsString()
  @IsNotEmpty()
  comment: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.userId)
  @IsNotEmpty({ message: 'Guest name is required when not logged in' })
  guestName?: string;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.guestName)
  @IsNotEmpty({ message: 'User ID is required when logged in' })
  userId?: string;
}
