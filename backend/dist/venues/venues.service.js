"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VenuesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const venue_entity_1 = require("./venue.entity");
let VenuesService = class VenuesService {
    constructor(venuesRepo) {
        this.venuesRepo = venuesRepo;
    }
    async findAll(district) {
        const qb = this.venuesRepo
            .createQueryBuilder('venue')
            .where('venue.isActive = true')
            .orderBy('venue.name', 'ASC');
        if (district) {
            qb.andWhere('venue.district = :district', { district });
        }
        return qb.getMany();
    }
    async findById(id) {
        const venue = await this.venuesRepo.findOne({ where: { id } });
        if (!venue)
            throw new common_1.NotFoundException('Mekan bulunamadı');
        return venue;
    }
    async create(data) {
        const venue = this.venuesRepo.create(data);
        return this.venuesRepo.save(venue);
    }
    async seed() {
        const count = await this.venuesRepo.count();
        if (count > 0)
            return;
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
};
exports.VenuesService = VenuesService;
exports.VenuesService = VenuesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(venue_entity_1.Venue)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], VenuesService);
//# sourceMappingURL=venues.service.js.map