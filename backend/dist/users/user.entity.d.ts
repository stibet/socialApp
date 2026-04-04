import { GroupMember } from '../groups/group-member.entity';
import { Review } from '../reviews/review.entity';
export declare enum Gender {
    MALE = "male",
    FEMALE = "female",
    OTHER = "other"
}
export declare class User {
    id: string;
    phone: string;
    name: string;
    gender: Gender;
    avatar: string;
    bio: string;
    trustScore: number;
    totalMeetups: number;
    isActive: boolean;
    otpCode: string;
    otpExpiry: Date;
    createdAt: Date;
    updatedAt: Date;
    groupMemberships: GroupMember[];
    receivedReviews: Review[];
    givenReviews: Review[];
}
