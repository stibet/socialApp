import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { Gender } from '../users/user.entity';
export declare class AuthService {
    private usersService;
    private jwtService;
    private config;
    constructor(usersService: UsersService, jwtService: JwtService, config: ConfigService);
    generateOtp(): string;
    sendOtp(phone: string): Promise<{
        message: string;
    }>;
    verifyOtp(phone: string, otp: string, name?: string, gender?: Gender): Promise<{
        token: string;
        isNewUser: boolean;
        user: any;
    }>;
}
