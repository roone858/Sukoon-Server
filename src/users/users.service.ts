/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateGoogleUserDto } from 'src/auth/strategies/dto/create-google-user.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /*** 🔍 FIND METHODS ***/

  async findAll() {
    const users = await this.userModel.find().select('-password -phone').lean();
    if (!users.length) throw new NotFoundException('No users found');
    return users;
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async delete(id: string) {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) throw new NotFoundException('User not found');

    const { password, ...safeUser } = user.toObject(); // إزالة كلمة المرور

    return safeUser;
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findByIdentifier(identifier: string): Promise<UserDocument | null> {
    const user = await this.userModel
      .findOne({
        $or: [{ email: identifier }, { username: identifier }],
      })
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByFacebookId(facebookId: string) {
    return this.userModel.findOne({ facebookId }).exec();
  }

  /*** 🔐 PASSWORD METHODS ***/

  async hashPassword(password: string): Promise<string> {
    const saltRounds = +process.env.SALT_ROUNDS;
    return bcrypt.hash(password + process.env.HASH_PASSWORD_KEY, saltRounds);
  }

  async comparePasswords(
    enteredPassword: string,
    storedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(
      enteredPassword + process.env.HASH_PASSWORD_KEY,
      storedPassword,
    );
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;

    const isPasswordValid = await this.comparePasswords(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) return null;

    const hashedNewPassword = await this.hashPassword(newPassword);
    return this.userModel.findByIdAndUpdate(
      id,
      { password: hashedNewPassword },
      { new: true },
    );
  }

  /*** 👤 USER CREATION & UPDATE ***/

  async createUser(
    createUserDto: CreateUserDto | CreateGoogleUserDto,
  ): Promise<UserDocument> {
    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await this.hashPassword(createUserDto.password);
    const user = new this.userModel({
      ...createUserDto,
      role: 'user',
      password: hashedPassword,
    });
    const result = await user.save();

    const { password, ...userWithoutPassword } = result.toObject();
    return userWithoutPassword;
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const { password, ...updateData } = updateUserDto;
    return this.userModel.findByIdAndUpdate(userId, updateData, { new: true });
  }

  async confirmEmail(userId: string): Promise<any> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { emailConfirmed: true },
      { new: true },
    );
  }

  async updateProfileImage(image: Express.Multer.File): Promise<any> {
    const res = await this.cloudinaryService.uploadFile(image);
    // اسم الملف بعد التحميل
    return res.url;
  }
}
