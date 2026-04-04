import { GroupsService } from './groups.service';
import { OfferType } from './group.entity';
declare class CreateGroupDto {
    eventId: string;
    offerType: OfferType;
    customNote?: string;
    maxMembers?: number;
}
export declare class GroupsController {
    private groupsService;
    constructor(groupsService: GroupsService);
    getMyGroups(req: any): Promise<import("./group.entity").Group[]>;
    getByEvent(eventId: string): Promise<import("./group.entity").Group[]>;
    findOne(id: string): Promise<import("./group.entity").Group>;
    create(req: any, dto: CreateGroupDto): Promise<import("./group.entity").Group>;
    join(id: string, req: any): Promise<import("./group.entity").Group>;
    leave(id: string, req: any): Promise<void>;
    close(id: string, req: any): Promise<void>;
}
export {};
