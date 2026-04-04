import { Venue } from '../venues/venue.entity';
import { Group } from '../groups/group.entity';
export declare class Event {
    id: string;
    title: string;
    description: string;
    eventDate: Date;
    imageUrl: string;
    source: string;
    isActive: boolean;
    venueId: string;
    venue: Venue;
    createdAt: Date;
    groups: Group[];
}
