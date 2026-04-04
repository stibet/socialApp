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
exports.GroupsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const group_entity_1 = require("./group.entity");
const group_member_entity_1 = require("./group-member.entity");
const events_service_1 = require("../events/events.service");
let GroupsService = class GroupsService {
    constructor(groupsRepo, membersRepo, eventsService) {
        this.groupsRepo = groupsRepo;
        this.membersRepo = membersRepo;
        this.eventsService = eventsService;
    }
    async findByEvent(eventId) {
        return this.groupsRepo
            .createQueryBuilder('group')
            .leftJoinAndSelect('group.members', 'member')
            .leftJoinAndSelect('member.user', 'user')
            .leftJoinAndSelect('group.creator', 'creator')
            .where('group.eventId = :eventId', { eventId })
            .andWhere('group.status = :status', { status: group_entity_1.GroupStatus.OPEN })
            .orderBy('group.createdAt', 'DESC')
            .getMany();
    }
    async findById(id) {
        const group = await this.groupsRepo
            .createQueryBuilder('group')
            .leftJoinAndSelect('group.members', 'member')
            .leftJoinAndSelect('member.user', 'user')
            .leftJoinAndSelect('group.creator', 'creator')
            .leftJoinAndSelect('group.event', 'event')
            .leftJoinAndSelect('event.venue', 'venue')
            .where('group.id = :id', { id })
            .getOne();
        if (!group)
            throw new common_1.NotFoundException('Grup bulunamadı');
        return group;
    }
    async create(userId, data) {
        await this.eventsService.findById(data.eventId);
        const group = this.groupsRepo.create({
            ...data,
            creatorId: userId,
            maxMembers: data.maxMembers || 10,
        });
        const saved = await this.groupsRepo.save(group);
        await this.membersRepo.save(this.membersRepo.create({
            groupId: saved.id,
            userId,
            role: group_member_entity_1.MemberRole.CREATOR,
        }));
        return this.findById(saved.id);
    }
    async join(groupId, userId) {
        const group = await this.findById(groupId);
        if (group.status !== group_entity_1.GroupStatus.OPEN) {
            throw new common_1.BadRequestException('Bu grup artık katılıma açık değil');
        }
        const alreadyMember = group.members.some((m) => m.userId === userId);
        if (alreadyMember)
            throw new common_1.BadRequestException('Zaten bu grubun üyesisiniz');
        if (group.members.length >= group.maxMembers) {
            await this.groupsRepo.update(groupId, { status: group_entity_1.GroupStatus.FULL });
            throw new common_1.BadRequestException('Grup dolu');
        }
        await this.membersRepo.save(this.membersRepo.create({ groupId, userId, role: group_member_entity_1.MemberRole.MEMBER }));
        const updated = await this.findById(groupId);
        if (updated.members.length >= group.maxMembers) {
            await this.groupsRepo.update(groupId, { status: group_entity_1.GroupStatus.FULL });
        }
        return this.findById(groupId);
    }
    async leave(groupId, userId) {
        const group = await this.findById(groupId);
        if (group.creatorId === userId) {
            throw new common_1.BadRequestException('Grup kurucusu gruptan ayrılamaz. Grubu kapatabilirsiniz.');
        }
        await this.membersRepo.delete({ groupId, userId });
        if (group.status === group_entity_1.GroupStatus.FULL) {
            await this.groupsRepo.update(groupId, { status: group_entity_1.GroupStatus.OPEN });
        }
    }
    async close(groupId, userId) {
        const group = await this.findById(groupId);
        if (group.creatorId !== userId) {
            throw new common_1.ForbiddenException('Sadece grup kurucusu kapatabilir');
        }
        await this.groupsRepo.update(groupId, { status: group_entity_1.GroupStatus.CLOSED });
    }
    async findUserGroups(userId) {
        return this.groupsRepo
            .createQueryBuilder('group')
            .leftJoinAndSelect('group.members', 'member')
            .leftJoinAndSelect('member.user', 'user')
            .leftJoinAndSelect('group.event', 'event')
            .leftJoinAndSelect('event.venue', 'venue')
            .leftJoinAndSelect('group.creator', 'creator')
            .where('member.userId = :userId', { userId })
            .orderBy('group.createdAt', 'DESC')
            .getMany();
    }
};
exports.GroupsService = GroupsService;
exports.GroupsService = GroupsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(group_entity_1.Group)),
    __param(1, (0, typeorm_1.InjectRepository)(group_member_entity_1.GroupMember)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        events_service_1.EventsService])
], GroupsService);
//# sourceMappingURL=groups.service.js.map