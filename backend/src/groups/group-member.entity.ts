import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Group } from './group.entity';
import { User } from '../users/user.entity';

export enum MemberRole {
  CREATOR = 'creator',
  MEMBER = 'member',
}

@Entity('group_members')
export class GroupMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  groupId: string;

  @ManyToOne(() => Group, (g) => g.members)
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @Column()
  userId: string;

  @ManyToOne(() => User, (u) => u.groupMemberships)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: MemberRole, default: MemberRole.MEMBER })
  role: MemberRole;

  @CreateDateColumn()
  joinedAt: Date;
}
