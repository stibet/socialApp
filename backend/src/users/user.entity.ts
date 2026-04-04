import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { GroupMember } from '../groups/group-member.entity';
import { Review } from '../reviews/review.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  phone: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true, length: 500 })
  bio: string;

  @Column({ type: 'float', default: 0 })
  trustScore: number;

  @Column({ default: 0 })
  totalMeetups: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  otpCode: string;

  @Column({ nullable: true })
  otpExpiry: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => GroupMember, (gm) => gm.user)
  groupMemberships: GroupMember[];

  @OneToMany(() => Review, (r) => r.reviewee)
  receivedReviews: Review[];

  @OneToMany(() => Review, (r) => r.reviewer)
  givenReviews: Review[];
}
