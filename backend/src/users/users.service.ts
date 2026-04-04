import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
    return user;
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { phone } });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.usersRepo.create(data);
    return this.usersRepo.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.usersRepo.update(id, data);
    return this.findById(id);
  }

  async updateOtp(phone: string, otp: string, expiry: Date): Promise<void> {
    await this.usersRepo.update({ phone }, { otpCode: otp, otpExpiry: expiry });
  }

  async clearOtp(id: string): Promise<void> {
    await this.usersRepo.update(id, { otpCode: null, otpExpiry: null });
  }

  async updateTrustScore(userId: string): Promise<void> {
    const user = await this.usersRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.receivedReviews', 'review')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!user || !user.receivedReviews.length) return;

    const avg =
      user.receivedReviews.reduce((sum, r) => sum + r.rating, 0) /
      user.receivedReviews.length;

    await this.usersRepo.update(userId, {
      trustScore: Math.round(avg * 10) / 10,
      totalMeetups: user.receivedReviews.length,
    });
  }

  async getProfile(id: string) {
    const user = await this.usersRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.receivedReviews', 'review')
      .leftJoinAndSelect('review.reviewer', 'reviewer')
      .where('user.id = :id', { id })
      .getOne();

    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
    return user;
  }
}
