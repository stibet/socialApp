import { Group } from './group.entity';
import { User } from '../users/user.entity';
export declare enum MemberRole {
    CREATOR = "creator",
    MEMBER = "member"
}
export declare class GroupMember {
    id: string;
    groupId: string;
    group: Group;
    userId: string;
    user: User;
    role: MemberRole;
    joinedAt: Date;
}
