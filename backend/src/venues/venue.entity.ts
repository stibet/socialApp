import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, OneToMany,
} from 'typeorm';
import { Event } from '../events/event.entity';

@Entity('venues')
export class Venue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  district: string; // Kızılay, Çankaya, etc.

  @Column({ nullable: true })
  instagram: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: true })
  hasDamsizPolicy: boolean; // true = damsız almıyor

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[]; // ['canlı müzik', 'bar', 'kulüp', 'kafeterya']

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Event, (e) => e.venue)
  events: Event[];
}
