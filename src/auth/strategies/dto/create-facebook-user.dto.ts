import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export enum UserRole {
  User = 'user',
  Admin = 'admin',
}

export class CreateFacebookUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  password?: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  profilePicture?: string;

  @IsBoolean()
  @IsOptional()
  emailConfirmed?: boolean;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsOptional()
  googleId?: string;

  @IsString()
  @IsOptional()
  facebookId?: string;
}
