import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Venue } from '../venues/venue.entity';
import { Group } from '../groups/group.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true, length: 1000 })
  description: string;

  @Column({ type: 'timestamp' })
  eventDate: Date;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: 'manual' })
  source: string; // 'manual' | 'scraped'

  @Column({ default: true })
  isActive: boolean;

  @Column()
  venueId: string;

  @ManyToOne(() => Venue, (v) => v.events)
  @JoinColumn({ name: 'venueId' })
  venue: Venue;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Group, (g) => g.event)
  groups: Group[];
}
