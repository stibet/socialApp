import { EventsService } from './events.service';
declare class CreateEventDto {
    title: string;
    description?: string;
    eventDate: Date;
    venueId: string;
    imageUrl?: string;
}
export declare class EventsController {
    private eventsService;
    constructor(eventsService: EventsService);
    findAll(venueId?: string): Promise<import("./event.entity").Event[]>;
    findToday(): Promise<import("./event.entity").Event[]>;
    findOne(id: string): Promise<import("./event.entity").Event>;
    create(dto: CreateEventDto): Promise<import("./event.entity").Event>;
}
export {};
