import { Event } from '../events/event.entity';
export declare class Venue {
    id: string;
    name: string;
    address: string;
    district: string;
    instagram: string;
    phone: string;
    imageUrl: string;
    hasDamsizPolicy: boolean;
    isActive: boolean;
    tags: string[];
    createdAt: Date;
    events: Event[];
}
