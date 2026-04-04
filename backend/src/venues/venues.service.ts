import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venue } from './venue.entity';

@Injectable()
export class VenuesService {
  constructor(
    @InjectRepository(Venue)
    private venuesRepo: Repository<Venue>,
  ) {}

  async findAll(district?: string): Promise<Venue[]> {
    const qb = this.venuesRepo
      .createQueryBuilder('venue')
      .where('venue.isActive = true')
      .orderBy('venue.name', 'ASC');

    if (district) {
      qb.andWhere('venue.district = :district', { district });
    }

    return qb.getMany();
  }

  async findById(id: string): Promise<Venue> {
    const venue = await this.venuesRepo.findOne({ where: { id } });
    if (!venue) throw new NotFoundException('Mekan bulunamadı');
    return venue;
  }

  async create(data: Partial<Venue>): Promise<Venue> {
    const venue = this.venuesRepo.create(data);
    return this.venuesRepo.save(venue);
  }

  async seed(): Promise<void> {
    const count = await this.venuesRepo.count();
    if (count > 0) return;

    const venues = [
      {
        name: 'Kızılay Bar',
        address: 'Kızılay Meydanı, Çankaya/Ankara',
        district: 'Kızılay',
        hasDamsizPolicy: true,
        tags: ['bar', 'canlı müzik'],
        instagram: 'kizilay.bar',
      },
      {
        name: 'Tunalı Pub',
        address: 'Tunalı Hilmi Caddesi, Çankaya/Ankara',
        district: 'Çankaya',
        hasDamsizPolicy: true,
        tags: ['pub', 'spor bar'],
        instagram: 'tunali.pub',
      },
      {
        name: 'Arjantin Caddesi Lounge',
        address: 'Arjantin Caddesi, Çankaya/Ankara',
        district: 'Çankaya',
        hasDamsizPolicy: false,
        tags: ['lounge', 'kokteyl'],
        instagram: 'arjantin.lounge',
      },
      {
        name: 'Ulus Meyhane',
        address: 'Ulus, Altındağ/Ankara',
        district: 'Ulus',
        hasDamsizPolicy: true,
        tags: ['meyhane', 'canlı müzik'],
        instagram: 'ulus.meyhane',
      },
      {
        name: 'Bahçelievler Kafé',
        address: 'Bahçelievler Mah., Çankaya/Ankara',
        district: 'Bahçelievler',
        hasDamsizPolicy: false,
        tags: ['kafé', 'bar'],
        instagram: 'bahcelievler.kafe',
      },
    ];

    for (const v of venues) {
      await this.create(v);
    }
    console.log('🏪 Venue seed tamamlandı');
  }
}
