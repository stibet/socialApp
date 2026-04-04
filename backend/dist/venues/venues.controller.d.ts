import { VenuesService } from './venues.service';
export declare class VenuesController {
    private venuesService;
    constructor(venuesService: VenuesService);
    findAll(district?: string): Promise<import("./venue.entity").Venue[]>;
    findOne(id: string): Promise<import("./venue.entity").Venue>;
    create(body: any): Promise<import("./venue.entity").Venue>;
    seed(): Promise<void>;
}
