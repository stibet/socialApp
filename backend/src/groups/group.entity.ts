import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Event } from '../events/event.entity';
import { User } from '../users/user.entity';
import { GroupMember } from './group-member.entity';

export enum OfferType {
  NONE = 'none',
  TWO_DRINK = '2drink',
  THREE_DRINK = '3drink',
  CUSTOM = 'custom',
}

export enum GroupStatus {
  OPEN = 'open',
  FULL = 'full',
  CLOSED = 'closed',
}

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: OfferType, default: OfferType.NONE })
  offerType: OfferType;

  @Column({ nullable: true, length: 300 })
  customNote: string;

  @Column({ default: 10 })
  maxMembers: number;

  @Column({ type: 'enum', enum: GroupStatus, default: GroupStatus.OPEN })
  status: GroupStatus;

  @Column()
  eventId: string;

  @ManyToOne(() => Event, (e) => e.groups)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  creatorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => GroupMember, (gm) => gm.group, { eager: true })
  members: GroupMember[];
}
