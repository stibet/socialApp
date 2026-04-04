import { ReviewsService } from './reviews.service';
declare class CreateReviewDto {
    revieweeId: string;
    groupId: string;
    rating: number;
    comment?: string;
}
export declare class ReviewsController {
    private reviewsService;
    constructor(reviewsService: ReviewsService);
    create(req: any, dto: CreateReviewDto): Promise<import("./review.entity").Review>;
    getByUser(userId: string): Promise<import("./review.entity").Review[]>;
}
export {};
