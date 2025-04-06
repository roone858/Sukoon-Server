export class ResponseUserDto {
  _id: string;
  username: string;
  email: string;
  name: string;
  phone?: string;
  profilePicture: string;
  emailConfirmed: boolean;
  role: 'user' | 'admin';
  googleId: string;
  facebookId: string;
}
