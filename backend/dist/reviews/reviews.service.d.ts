import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { UsersService } from '../users/users.service';
import { GroupsService } from '../groups/groups.service';
export declare class ReviewsService {
    private reviewsRepo;
    private usersService;
    private groupsService;
    constructor(reviewsRepo: Repository<Review>, usersService: UsersService, groupsService: GroupsService);
    create(reviewerId: string, data: {
        revieweeId: string;
        groupId: string;
        rating: number;
        comment?: string;
    }): Promise<Review>;
    findByUser(userId: string): Promise<Review[]>;
}
