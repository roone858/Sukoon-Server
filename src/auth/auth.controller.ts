import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  UseFilters,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { MongoExceptionFilter } from 'src/common/exceptions/mongo-exception.filter';
import { AuthGuard } from '@nestjs/passport';
@Controller('auth')
@UseFilters(MongoExceptionFilter)
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(LocalAuthGuard)
  signIn(@Request() req: any) {
    return req.user;
  }

  @Get('confirm')
  async emailConfirmation(
    @Query() query: { token: string },
    @Res() res: Response,
  ) {
    const result = await this.authService.confirmEmail(query.token);
    res.redirect(result.url);
  }
  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    // Call your AuthService to handle user creation and authentication
    const result = await this.authService.signUp(createUserDto);
    return {
      success: true,
      access_token: result.access_token,
      user: result.user,
    };
  }
  @Post('check-username')
  async checkUsername(
    @Body() body: { username: string },
  ): Promise<{ isTaken: boolean }> {
    const isTaken = await this.authService.isUsernameTaken(body.username);
    return { isTaken };
  }

  @Post('check-email')
  async checkEmail(
    @Body() body: { email: string },
  ): Promise<{ isExists: boolean }> {
    const isExists = await this.authService.isEmailExists(body.email);
    return { isExists };
  }
  @Post('resend-verification-email')
  async resendVerificationEmail(@Body() body: { email: string }) {
    await this.authService.resendVerificationEmail(body.email);
    return { message: 'Verification email sent successfully' };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: Request & { user?: any },
    @Res() res: Response,
  ) {
    const token = await this.authService.generateToken(req.user._id);
    res.redirect(
      process.env.CLIENT_BASE_URL +
        `/auth/callback?token=${token.access_token}`,
    );
  }
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {}

  @Get('facebook/redirect')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthRedirect(
    @Req() req: Request & { user?: any },
    @Res() res: Response,
  ) {
    const token = await this.authService.generateToken(req.user._id);
    res.redirect(
      process.env.CLIENT_BASE_URL +
        `/auth/callback?token=${token.access_token}`,
    );
  }
  @Get('verify-token')
  @UseGuards(AuthGuard('jwt'))
  verifyToken() {
    return { message: 'Token verified successfully' };
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Request() req) {
    return req.user;
  }
}
