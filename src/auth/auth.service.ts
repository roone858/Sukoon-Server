import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { MailService } from 'src/mail/mail.service';
import { CreateGoogleUserDto } from './strategies/dto/create-google-user.dto';
import { CreateFacebookUserDto } from './strategies/dto/create-facebook-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  /** 🔥 Generate JWT Token */
  async generateToken(userId: string): Promise<{ access_token: string }> {
    const payload = { _id: userId };
    return { access_token: await this.jwtService.signAsync(payload) };
  }

  /** 🔑 User Sign-In */
  async signIn(
    identifier: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findByIdentifier(identifier);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await this.usersService.comparePasswords(
      password,
      user.password,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user._id.toString());
  }

  /** 📝 User Sign-Up */
  async signUp(
    createUserDto: CreateUserDto,
  ): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    createUserDto.profilePicture =
      process.env.SERVER_BASE_URL +
      '/users/profile-picture/' +
      'default-profile-picture.webp';
    const newUser = await this.usersService.create(createUserDto);
    const token = await this.generateToken(newUser._id.toString());

    // Send verification email
    await this.mailService.sendVerificationEmail(
      createUserDto.email,
      token.access_token,
    );

    return { access_token: token.access_token, user: newUser };
  }

  /** 📩 Resend Verification Email */
  async resendVerificationEmail(email: string): Promise<void> {
    const token = await this.generateToken(email);
    await this.mailService.sendVerificationEmail(email, token.access_token);
  }

  /** 📩 Confirm Email */
  async confirmEmail(token: string): Promise<{ status: string; url: string }> {
    const decoded = (await this.jwtService.decode(token)) as {
      _id: string;
    } | null;
    if (!decoded || !decoded._id) {
      throw new NotFoundException('Invalid confirmation token');
    }
    await this.usersService.confirmEmail(decoded._id);
    return {
      status: 'success',
      url: process.env.CLIENT_BASE_URL + '/success-confirmed-email',
    };
  }

  /** 🔍 Find or Create Google User */
  async findOrCreateGoogleUser(
    user: CreateGoogleUserDto,
  ): Promise<UserDocument> {
    return (
      (await this.usersService.findByEmail(user.email)) ??
      this.usersService.createUser(user)
    );
  }

  /** 🔍 Find or Create Facebook User */
  async findOrCreateFacebookUser(
    user: CreateFacebookUserDto,
  ): Promise<UserDocument> {
    return (
      (await this.usersService.findByFacebookId(user.facebookId)) ??
      this.usersService.createUser(user)
    );
  }

  /** 🔄 Check if Username is Taken */
  async isUsernameTaken(username: string): Promise<boolean> {
    return !!(await this.usersService.findByIdentifier(username));
  }

  /** 🔄 Check if Email Exists */
  async isEmailExists(email: string): Promise<boolean> {
    return !!(await this.usersService.findByEmail(email));
  }
}
