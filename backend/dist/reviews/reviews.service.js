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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const review_entity_1 = require("./review.entity");
const users_service_1 = require("../users/users.service");
const groups_service_1 = require("../groups/groups.service");
let ReviewsService = class ReviewsService {
    constructor(reviewsRepo, usersService, groupsService) {
        this.reviewsRepo = reviewsRepo;
        this.usersService = usersService;
        this.groupsService = groupsService;
    }
    async create(reviewerId, data) {
        if (reviewerId === data.revieweeId) {
            throw new common_1.BadRequestException('Kendinizi puanlayamazsınız');
        }
        if (data.rating < 1 || data.rating > 5) {
            throw new common_1.BadRequestException('Puan 1-5 arasında olmalıdır');
        }
        const group = await this.groupsService.findById(data.groupId);
        const reviewerInGroup = group.members.some((m) => m.userId === reviewerId);
        const revieweeInGroup = group.members.some((m) => m.userId === data.revieweeId);
        if (!reviewerInGroup || !revieweeInGroup) {
            throw new common_1.BadRequestException('Her iki kullanıcı da aynı grupta olmalıdır');
        }
        const existing = await this.reviewsRepo.findOne({
            where: {
                reviewerId,
                revieweeId: data.revieweeId,
                groupId: data.groupId,
            },
        });
        if (existing)
            throw new common_1.BadRequestException('Bu etkinlik için zaten puan verdiniz');
        const review = this.reviewsRepo.create({ reviewerId, ...data });
        const saved = await this.reviewsRepo.save(review);
        await this.usersService.updateTrustScore(data.revieweeId);
        return saved;
    }
    async findByUser(userId) {
        return this.reviewsRepo
            .createQueryBuilder('review')
            .leftJoinAndSelect('review.reviewer', 'reviewer')
            .where('review.revieweeId = :userId', { userId })
            .orderBy('review.createdAt', 'DESC')
            .getMany();
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService,
        groups_service_1.GroupsService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map