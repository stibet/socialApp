import { AuthService } from './auth.service';
import { Gender } from '../users/user.entity';
declare class SendOtpDto {
    phone: string;
}
declare class VerifyOtpDto {
    phone: string;
    otp: string;
    name?: string;
    gender?: Gender;
}
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    sendOtp(dto: SendOtpDto): Promise<{
        message: string;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
        token: string;
        isNewUser: boolean;
        user: any;
    }>;
}
export {};
