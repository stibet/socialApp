import { Event } from '../events/event.entity';
import { User } from '../users/user.entity';
import { GroupMember } from './group-member.entity';
export declare enum OfferType {
    NONE = "none",
    TWO_DRINK = "2drink",
    THREE_DRINK = "3drink",
    CUSTOM = "custom"
}
export declare enum GroupStatus {
    OPEN = "open",
    FULL = "full",
    CLOSED = "closed"
}
export declare class Group {
    id: string;
    offerType: OfferType;
    customNote: string;
    maxMembers: number;
    status: GroupStatus;
    eventId: string;
    event: Event;
    creatorId: string;
    creator: User;
    createdAt: Date;
    members: GroupMember[];
}
