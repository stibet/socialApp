import {
  Injectable, BadRequestException, UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { Gender } from '../users/user.entity';

const sendSms = async (phone: string, message: string) => {
  console.log(`📱 SMS to ${phone}: ${message}`);
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(phone: string): Promise<{ message: string }> {
    const normalizedPhone = phone.startsWith('+') ? phone : `+90${phone}`;
    const otp = this.generateOtp();
    const expiryMinutes = this.config.get('OTP_EXPIRY_MINUTES', 5);
    const expiry = new Date(Date.now() + expiryMinutes * 60 * 1000);

    let user = await this.usersService.findByPhone(normalizedPhone);
    if (!user) {
      user = await this.usersService.create({
        phone: normalizedPhone,
        name: '',
        gender: Gender.OTHER,
        otpCode: otp,
        otpExpiry: expiry,
      });
    } else {
      await this.usersService.updateOtp(normalizedPhone, otp, expiry);
    }

    await sendSms(normalizedPhone, `Dambul doğrulama kodun: ${otp}`);
    return { message: 'OTP gönderildi' };
  }

  async verifyOtp(
    phone: string,
    otp: string,
    name?: string,
    gender?: Gender,
  ): Promise<{ token: string; isNewUser: boolean; user: any }> {
    const normalizedPhone = phone.startsWith('+') ? phone : `+90${phone}`;
    const user = await this.usersService.findByPhone(normalizedPhone);

    if (!user) throw new UnauthorizedException('Kullanıcı bulunamadı');
    if (user.otpCode !== otp) throw new BadRequestException('Hatalı OTP kodu');
    if (new Date() > user.otpExpiry) throw new BadRequestException('OTP süresi doldu');

    const isNewUser = !user.name;

    if (isNewUser && name && gender) {
      await this.usersService.update(user.id, { name, gender });
    }

    await this.usersService.clearOtp(user.id);
    const updatedUser = await this.usersService.findById(user.id);
    const token = this.jwtService.sign({ sub: user.id, phone: user.phone });

    return { token, isNewUser, user: updatedUser };
  }
}