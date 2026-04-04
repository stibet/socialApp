import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsString, IsOptional, IsEnum, Length } from 'class-validator';
import { Gender } from '../users/user.entity';

class SendOtpDto {
  @IsString()
  phone: string;
}

class VerifyOtpDto {
  @IsString()
  phone: string;

  @IsString()
  @Length(6, 6)
  otp: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('send-otp')
  sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto.phone);
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.phone, dto.otp, dto.name, dto.gender);
  }
}