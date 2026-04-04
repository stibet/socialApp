import { User } from '../users/user.entity';
export declare class Review {
    id: string;
    reviewerId: string;
    reviewer: User;
    revieweeId: string;
    reviewee: User;
    groupId: string;
    rating: number;
    comment: string;
    createdAt: Date;
}
