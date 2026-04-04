import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { VenuesService } from '../venues/venues.service';
export declare class EventsService {
    private eventsRepo;
    private venuesService;
    constructor(eventsRepo: Repository<Event>, venuesService: VenuesService);
    findUpcoming(venueId?: string): Promise<Event[]>;
    findById(id: string): Promise<Event>;
    create(data: {
        title: string;
        description?: string;
        eventDate: Date;
        venueId: string;
        imageUrl?: string;
    }): Promise<Event>;
    findToday(): Promise<Event[]>;
    seed(venueIds: string[]): Promise<void>;
}
