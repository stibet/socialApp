import { Repository } from 'typeorm';
import { Group, OfferType } from './group.entity';
import { GroupMember } from './group-member.entity';
import { EventsService } from '../events/events.service';
export declare class GroupsService {
    private groupsRepo;
    private membersRepo;
    private eventsService;
    constructor(groupsRepo: Repository<Group>, membersRepo: Repository<GroupMember>, eventsService: EventsService);
    findByEvent(eventId: string): Promise<Group[]>;
    findById(id: string): Promise<Group>;
    create(userId: string, data: {
        eventId: string;
        offerType: OfferType;
        customNote?: string;
        maxMembers?: number;
    }): Promise<Group>;
    join(groupId: string, userId: string): Promise<Group>;
    leave(groupId: string, userId: string): Promise<void>;
    close(groupId: string, userId: string): Promise<void>;
    findUserGroups(userId: string): Promise<Group[]>;
}
