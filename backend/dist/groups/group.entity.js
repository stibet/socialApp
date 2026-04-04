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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Group = exports.GroupStatus = exports.OfferType = void 0;
const typeorm_1 = require("typeorm");
const event_entity_1 = require("../events/event.entity");
const user_entity_1 = require("../users/user.entity");
const group_member_entity_1 = require("./group-member.entity");
var OfferType;
(function (OfferType) {
    OfferType["NONE"] = "none";
    OfferType["TWO_DRINK"] = "2drink";
    OfferType["THREE_DRINK"] = "3drink";
    OfferType["CUSTOM"] = "custom";
})(OfferType || (exports.OfferType = OfferType = {}));
var GroupStatus;
(function (GroupStatus) {
    GroupStatus["OPEN"] = "open";
    GroupStatus["FULL"] = "full";
    GroupStatus["CLOSED"] = "closed";
})(GroupStatus || (exports.GroupStatus = GroupStatus = {}));
let Group = class Group {
};
exports.Group = Group;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Group.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: OfferType, default: OfferType.NONE }),
    __metadata("design:type", String)
], Group.prototype, "offerType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 300 }),
    __metadata("design:type", String)
], Group.prototype, "customNote", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 10 }),
    __metadata("design:type", Number)
], Group.prototype, "maxMembers", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: GroupStatus, default: GroupStatus.OPEN }),
    __metadata("design:type", String)
], Group.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Group.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => event_entity_1.Event, (e) => e.groups),
    (0, typeorm_1.JoinColumn)({ name: 'eventId' }),
    __metadata("design:type", event_entity_1.Event)
], Group.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Group.prototype, "creatorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'creatorId' }),
    __metadata("design:type", user_entity_1.User)
], Group.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Group.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => group_member_entity_1.GroupMember, (gm) => gm.group, { eager: true }),
    __metadata("design:type", Array)
], Group.prototype, "members", void 0);
exports.Group = Group = __decorate([
    (0, typeorm_1.Entity)('groups')
], Group);
//# sourceMappingURL=group.entity.js.map