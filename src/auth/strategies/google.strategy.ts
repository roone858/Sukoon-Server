// google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { createSlug } from 'src/common/Util/createSlug';
import { UserRole } from 'src/users/dto/create-user.dto';
import { CreateGoogleUserDto } from './dto/create-google-user.dto';
interface ProfileInterface {
  id: string;
  emails: { value: string }[];
  photos: { value: string }[];
  displayName: string;
  profile: { name: string; photo: string };
  username: string;
  emailConfirmed: true;
}
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_APP_ID,
      clientSecret: process.env.GOOGLE_APP_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: ProfileInterface,
    done: VerifyCallback,
  ) {
    try {
      const baseUsername = createSlug(
        `${profile.displayName} ${profile.id} `,
      ).toLowerCase();

      const newUser: CreateGoogleUserDto = {
        googleId: profile.id,
        email: profile.emails[0].value,

        name: profile.displayName,
        profilePicture: profile.photos[0].value,

        username: baseUsername,
        emailConfirmed: true,
        role: UserRole.User,
      };

      const user = await this.authService.findOrCreateGoogleUser(newUser);

      done(null, user);
    } catch (error) {
      console.log(error);
      done(error, null);
    }
  }
}
