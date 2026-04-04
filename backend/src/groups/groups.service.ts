import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group, OfferType, GroupStatus } from './group.entity';
import { GroupMember, MemberRole } from './group-member.entity';
import { EventsService } from '../events/events.service';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupsRepo: Repository<Group>,
    @InjectRepository(GroupMember)
    private membersRepo: Repository<GroupMember>,
    private eventsService: EventsService,
  ) {}

  async findByEvent(eventId: string): Promise<Group[]> {
    return this.groupsRepo
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.members', 'member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('group.creator', 'creator')
      .where('group.eventId = :eventId', { eventId })
      .andWhere('group.status = :status', { status: GroupStatus.OPEN })
      .orderBy('group.createdAt', 'DESC')
      .getMany();
  }

  async findById(id: string): Promise<Group> {
    const group = await this.groupsRepo
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.members', 'member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('group.creator', 'creator')
      .leftJoinAndSelect('group.event', 'event')
      .leftJoinAndSelect('event.venue', 'venue')
      .where('group.id = :id', { id })
      .getOne();

    if (!group) throw new NotFoundException('Grup bulunamadı');
    return group;
  }

  async create(
    userId: string,
    data: {
      eventId: string;
      offerType: OfferType;
      customNote?: string;
      maxMembers?: number;
    },
  ): Promise<Group> {
    await this.eventsService.findById(data.eventId); // validate event exists

    const group = this.groupsRepo.create({
      ...data,
      creatorId: userId,
      maxMembers: data.maxMembers || 10,
    });
    const saved = await this.groupsRepo.save(group);

    // Auto-add creator as member
    await this.membersRepo.save(
      this.membersRepo.create({
        groupId: saved.id,
        userId,
        role: MemberRole.CREATOR,
      }),
    );

    return this.findById(saved.id);
  }

  async join(groupId: string, userId: string): Promise<Group> {
    const group = await this.findById(groupId);

    if (group.status !== GroupStatus.OPEN) {
      throw new BadRequestException('Bu grup artık katılıma açık değil');
    }

    const alreadyMember = group.members.some((m) => m.userId === userId);
    if (alreadyMember) throw new BadRequestException('Zaten bu grubun üyesisiniz');

    if (group.members.length >= group.maxMembers) {
      await this.groupsRepo.update(groupId, { status: GroupStatus.FULL });
      throw new BadRequestException('Grup dolu');
    }

    await this.membersRepo.save(
      this.membersRepo.create({ groupId, userId, role: MemberRole.MEMBER }),
    );

    const updated = await this.findById(groupId);

    // Check if now full
    if (updated.members.length >= group.maxMembers) {
      await this.groupsRepo.update(groupId, { status: GroupStatus.FULL });
    }

    return this.findById(groupId);
  }

  async leave(groupId: string, userId: string): Promise<void> {
    const group = await this.findById(groupId);

    if (group.creatorId === userId) {
      throw new BadRequestException('Grup kurucusu gruptan ayrılamaz. Grubu kapatabilirsiniz.');
    }

    await this.membersRepo.delete({ groupId, userId });

    // Reopen if was full
    if (group.status === GroupStatus.FULL) {
      await this.groupsRepo.update(groupId, { status: GroupStatus.OPEN });
    }
  }

  async close(groupId: string, userId: string): Promise<void> {
    const group = await this.findById(groupId);
    if (group.creatorId !== userId) {
      throw new ForbiddenException('Sadece grup kurucusu kapatabilir');
    }
    await this.groupsRepo.update(groupId, { status: GroupStatus.CLOSED });
  }

  async findUserGroups(userId: string): Promise<Group[]> {
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
}
