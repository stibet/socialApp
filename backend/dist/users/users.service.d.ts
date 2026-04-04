import { Repository } from 'typeorm';
import { User } from './user.entity';
export declare class UsersService {
    private usersRepo;
    constructor(usersRepo: Repository<User>);
    findById(id: string): Promise<User>;
    findByPhone(phone: string): Promise<User | null>;
    create(data: Partial<User>): Promise<User>;
    update(id: string, data: Partial<User>): Promise<User>;
    updateOtp(phone: string, otp: string, expiry: Date): Promise<void>;
    clearOtp(id: string): Promise<void>;
    updateTrustScore(userId: string): Promise<void>;
    getProfile(id: string): Promise<User>;
}
