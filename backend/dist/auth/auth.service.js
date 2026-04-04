"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../users/users.service");
const user_entity_1 = require("../users/user.entity");
const sendSms = async (phone, message) => {
    console.log(`📱 SMS to ${phone}: ${message}`);
};
let AuthService = class AuthService {
    constructor(usersService, jwtService, config) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.config = config;
    }
    generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async sendOtp(phone) {
        const normalizedPhone = phone.startsWith('+') ? phone : `+90${phone}`;
        const otp = this.generateOtp();
        const expiryMinutes = this.config.get('OTP_EXPIRY_MINUTES', 5);
        const expiry = new Date(Date.now() + expiryMinutes * 60 * 1000);
        let user = await this.usersService.findByPhone(normalizedPhone);
        if (!user) {
            user = await this.usersService.create({
                phone: normalizedPhone,
                name: '',
                gender: user_entity_1.Gender.OTHER,
                otpCode: otp,
                otpExpiry: expiry,
            });
        }
        else {
            await this.usersService.updateOtp(normalizedPhone, otp, expiry);
        }
        await sendSms(normalizedPhone, `Dambul doğrulama kodun: ${otp}`);
        return { message: 'OTP gönderildi' };
    }
    async verifyOtp(phone, otp, name, gender) {
        const normalizedPhone = phone.startsWith('+') ? phone : `+90${phone}`;
        const user = await this.usersService.findByPhone(normalizedPhone);
        if (!user)
            throw new common_1.UnauthorizedException('Kullanıcı bulunamadı');
        if (user.otpCode !== otp)
            throw new common_1.BadRequestException('Hatalı OTP kodu');
        if (new Date() > user.otpExpiry)
            throw new common_1.BadRequestException('OTP süresi doldu');
        const isNewUser = !user.name;
        if (isNewUser && name && gender) {
            await this.usersService.update(user.id, { name, gender });
        }
        await this.usersService.clearOtp(user.id);
        const updatedUser = await this.usersService.findById(user.id);
        const token = this.jwtService.sign({ sub: user.id, phone: user.phone });
        return { token, isNewUser, user: updatedUser };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map