import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Event } from './event.entity';
import { VenuesService } from '../venues/venues.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepo: Repository<Event>,
    private venuesService: VenuesService,
  ) {}

  async findUpcoming(venueId?: string): Promise<Event[]> {
    const qb = this.eventsRepo
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.venue', 'venue')
      .where('event.isActive = true')
      .andWhere('event.eventDate >= :now', { now: new Date() })
      .orderBy('event.eventDate', 'ASC');

    if (venueId) {
      qb.andWhere('event.venueId = :venueId', { venueId });
    }

    return qb.getMany();
  }

  async findById(id: string): Promise<Event> {
    const event = await this.eventsRepo
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.venue', 'venue')
      .leftJoinAndSelect('event.groups', 'group')
      .leftJoinAndSelect('group.members', 'member')
      .leftJoinAndSelect('member.user', 'user')
      .where('event.id = :id', { id })
      .getOne();

    if (!event) throw new NotFoundException('Etkinlik bulunamadı');
    return event;
  }

  async create(data: {
    title: string;
    description?: string;
    eventDate: Date;
    venueId: string;
    imageUrl?: string;
  }): Promise<Event> {
    await this.venuesService.findById(data.venueId); // validate
    const event = this.eventsRepo.create(data);
    return this.eventsRepo.save(event);
  }

  async findToday(): Promise<Event[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.eventsRepo
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.venue', 'venue')
      .where('event.isActive = true')
      .andWhere('event.eventDate BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .orderBy('event.eventDate', 'ASC')
      .getMany();
  }

  async seed(venueIds: string[]): Promise<void> {
    const count = await this.eventsRepo.count();
    if (count > 0) return;

    const now = new Date();
    const events = [
      {
        title: 'Canlı Müzik Gecesi',
        description: 'Akustik gitar ve vokal performansı',
        eventDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 21, 0),
        venueId: venueIds[0],
      },
      {
        title: 'DJ Night',
        description: 'En iyi elektronik müzik DJ\'leriyle gece',
        eventDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 22, 0),
        venueId: venueIds[1],
      },
      {
        title: 'Türk Sanat Müziği Gecesi',
        description: 'Türk sanat müziği klasikleri',
        eventDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 20, 30),
        venueId: venueIds[3],
      },
    ];

    for (const e of events) {
      await this.eventsRepo.save(this.eventsRepo.create(e));
    }
    console.log('🎉 Event seed tamamlandı');
  }
}
