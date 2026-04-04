import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('reviews')
@Unique(['reviewerId', 'revieweeId', 'groupId'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reviewerId: string;

  @ManyToOne(() => User, (u) => u.givenReviews)
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @Column()
  revieweeId: string;

  @ManyToOne(() => User, (u) => u.receivedReviews)
  @JoinColumn({ name: 'revieweeId' })
  reviewee: User;

  @Column()
  groupId: string;

  @Column({ type: 'int' })
  rating: number; // 1-5

  @Column({ nullable: true, length: 500 })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;
}
