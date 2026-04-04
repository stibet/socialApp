import { Repository } from 'typeorm';
import { Venue } from './venue.entity';
export declare class VenuesService {
    private venuesRepo;
    constructor(venuesRepo: Repository<Venue>);
    findAll(district?: string): Promise<Venue[]>;
    findById(id: string): Promise<Venue>;
    create(data: Partial<Venue>): Promise<Venue>;
    seed(): Promise<void>;
}
