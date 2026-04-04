import {
  Injectable, BadRequestException, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { UsersService } from '../users/users.service';
import { GroupsService } from '../groups/groups.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepo: Repository<Review>,
    private usersService: UsersService,
    private groupsService: GroupsService,
  ) {}

  async create(
    reviewerId: string,
    data: {
      revieweeId: string;
      groupId: string;
      rating: number;
      comment?: string;
    },
  ): Promise<Review> {
    if (reviewerId === data.revieweeId) {
      throw new BadRequestException('Kendinizi puanlayamazsınız');
    }

    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestException('Puan 1-5 arasında olmalıdır');
    }

    // Verify both users were in the group
    const group = await this.groupsService.findById(data.groupId);
    const reviewerInGroup = group.members.some((m) => m.userId === reviewerId);
    const revieweeInGroup = group.members.some((m) => m.userId === data.revieweeId);

    if (!reviewerInGroup || !revieweeInGroup) {
      throw new BadRequestException('Her iki kullanıcı da aynı grupta olmalıdır');
    }

    // Check for duplicate
    const existing = await this.reviewsRepo.findOne({
      where: {
        reviewerId,
        revieweeId: data.revieweeId,
        groupId: data.groupId,
      },
    });
    if (existing) throw new BadRequestException('Bu etkinlik için zaten puan verdiniz');

    const review = this.reviewsRepo.create({ reviewerId, ...data });
    const saved = await this.reviewsRepo.save(review);

    // Update trust score
    await this.usersService.updateTrustScore(data.revieweeId);

    return saved;
  }

  async findByUser(userId: string): Promise<Review[]> {
    return this.reviewsRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.reviewer', 'reviewer')
      .where('review.revieweeId = :userId', { userId })
      .orderBy('review.createdAt', 'DESC')
      .getMany();
  }
}
