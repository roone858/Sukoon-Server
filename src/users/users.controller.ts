import {
  Body,
  Post,
  Controller,
  UseGuards,
  Get,
  Patch,
  Request,
  Req,
  UseInterceptors,
  UploadedFile,
  Res,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AdminGuard } from './guards/admin.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseGuards(AdminGuard)
  createAdmin(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch('/:userId')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  updateByAdmin(
    @Request() req: any,
    @Body() updateUserDto: UpdateUserDto,
    @Param('userId') userId: string,
  ) {
    return this.usersService.updateUser(userId, updateUserDto);
  }

  @Patch()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('profilePicture')) // اسم الفيلد من الـ frontend
  async updateProfile(
    @UploadedFile() profilePicture: Express.Multer.File,
    @Request() req: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    // Ensure req.user._id exists and is valid
    if (!req.user?._id) {
      throw new BadRequestException('User ID not found in request');
    }

    if (profilePicture) {
      const imageUrl =
        await this.usersService.updateProfileImage(profilePicture);
      updateUserDto.profilePicture = imageUrl;
    }

    return this.usersService.updateUser(req.user._id, updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Delete(':userId')
  deleteUserByAdmin(@Param('userId') userId: string) {
    return this.usersService.delete(userId);
  }

  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(
    @Req() req,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ): Promise<{ message: string }> {
    const { _id } = req.user;
    const user = await this.usersService.changePassword(
      _id,
      currentPassword,
      newPassword,
    );
    if (user) {
      return { message: 'Password changed successfully' };
    } else {
      return {
        message: 'Current password is incorrect or failed to change password',
      };
    }
  }

  @Get('/profile-picture')
  // @UseGuards(JwtAuthGuard)
  getProfilePicture(@Res() res: Response) {
    const imagePath = join(
      __dirname,
      '..',
      '..',
      'images',
      'profiles pictures',
      'default-profile-picture.webp',
    );
    res.sendFile(imagePath);
  }
}
