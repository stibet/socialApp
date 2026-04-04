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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_entity_1 = require("./event.entity");
const venues_service_1 = require("../venues/venues.service");
let EventsService = class EventsService {
    constructor(eventsRepo, venuesService) {
        this.eventsRepo = eventsRepo;
        this.venuesService = venuesService;
    }
    async findUpcoming(venueId) {
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
    async findById(id) {
        const event = await this.eventsRepo
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.venue', 'venue')
            .leftJoinAndSelect('event.groups', 'group')
            .leftJoinAndSelect('group.members', 'member')
            .leftJoinAndSelect('member.user', 'user')
            .where('event.id = :id', { id })
            .getOne();
        if (!event)
            throw new common_1.NotFoundException('Etkinlik bulunamadı');
        return event;
    }
    async create(data) {
        await this.venuesService.findById(data.venueId);
        const event = this.eventsRepo.create(data);
        return this.eventsRepo.save(event);
    }
    async findToday() {
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
    async seed(venueIds) {
        const count = await this.eventsRepo.count();
        if (count > 0)
            return;
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
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        venues_service_1.VenuesService])
], EventsService);
//# sourceMappingURL=events.service.js.map